-- Dual-area access (Challenge / Clinic) + private clinic PDFs

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS challenge_status TEXT NOT NULL DEFAULT 'awaiting',
  ADD COLUMN IF NOT EXISTS clinic_status TEXT NOT NULL DEFAULT 'awaiting';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_challenge_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_challenge_status_check
  CHECK (challenge_status IN ('awaiting', 'approved', 'not_approved'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_clinic_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_clinic_status_check
  CHECK (clinic_status IN ('awaiting', 'approved', 'not_approved'));

UPDATE public.profiles
SET challenge_status = 'awaiting'
WHERE challenge_status IS NULL OR challenge_status NOT IN ('awaiting', 'approved', 'not_approved');

UPDATE public.profiles
SET clinic_status = 'awaiting'
WHERE clinic_status IS NULL OR clinic_status NOT IN ('awaiting', 'approved', 'not_approved');

CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_uid, 'admin');
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.challenge_approved(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(_uid)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = _uid AND p.challenge_status = 'approved'
    );
$$;

CREATE OR REPLACE FUNCTION public.clinic_approved(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(_uid)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = _uid AND p.clinic_status = 'approved'
    );
$$;

REVOKE ALL ON FUNCTION public.challenge_approved(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.clinic_approved(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.challenge_approved(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clinic_approved(uuid) TO authenticated, service_role;

-- Prevent non-admins from changing access statuses
CREATE OR REPLACE FUNCTION public.protect_profile_access_statuses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.challenge_status IS DISTINCT FROM OLD.challenge_status
     OR NEW.clinic_status IS DISTINCT FROM OLD.clinic_status THEN
    RAISE EXCEPTION 'Access status can only be changed by an admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_access_statuses ON public.profiles;
CREATE TRIGGER profiles_protect_access_statuses
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_access_statuses();

CREATE OR REPLACE FUNCTION public.request_area_access(_area text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _area = 'challenge' THEN
    UPDATE public.profiles
    SET challenge_status = 'awaiting'
    WHERE id = auth.uid() AND challenge_status = 'not_approved';
  ELSIF _area = 'clinic' THEN
    UPDATE public.profiles
    SET clinic_status = 'awaiting'
    WHERE id = auth.uid() AND clinic_status = 'not_approved';
  ELSE
    RAISE EXCEPTION 'Unknown area';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.request_area_access(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_area_access(text) TO authenticated, service_role;

-- Profiles: own read; admin read all; own update (statuses blocked by trigger); admin update
DROP POLICY IF EXISTS "Own profile read" ON public.profiles;
DROP POLICY IF EXISTS "Own profile insert" ON public.profiles;
DROP POLICY IF EXISTS "Own profile update" ON public.profiles;
DROP POLICY IF EXISTS "Admin profile read" ON public.profiles;
DROP POLICY IF EXISTS "Admin profile update" ON public.profiles;

CREATE POLICY "Own profile read" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Own profile insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Own profile update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Challenge tables: approved challenge (or admin)
DROP POLICY IF EXISTS "Own entries all" ON public.daily_entries;
CREATE POLICY "Challenge entries access" ON public.daily_entries
  FOR ALL TO authenticated
  USING (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()));

DROP POLICY IF EXISTS "Own onboarding all" ON public.onboarding_responses;
CREATE POLICY "Challenge onboarding access" ON public.onboarding_responses
  FOR ALL TO authenticated
  USING (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()));

DROP POLICY IF EXISTS "Own wheel all" ON public.transformation_wheel;
DROP POLICY IF EXISTS "Admins can view all wheels" ON public.transformation_wheel;
CREATE POLICY "Challenge wheel access" ON public.transformation_wheel
  FOR ALL TO authenticated
  USING (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()));

DROP POLICY IF EXISTS "Own vision items all" ON public.vision_board_items;
CREATE POLICY "Challenge vision access" ON public.vision_board_items
  FOR ALL TO authenticated
  USING (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()));

DROP POLICY IF EXISTS "Own struggle all" ON public.struggle_moments;
CREATE POLICY "Challenge struggle access" ON public.struggle_moments
  FOR ALL TO authenticated
  USING (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()));

DROP POLICY IF EXISTS "Own weekly photos" ON public.weekly_photos;
CREATE POLICY "Challenge weekly photos access" ON public.weekly_photos
  FOR ALL TO authenticated
  USING (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (public.challenge_approved() AND (auth.uid() = user_id OR public.is_admin()));

-- Clinic documents
CREATE TABLE IF NOT EXISTS public.clinic_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('pathology', 'treatment', 'supplements')),
  storage_path TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, doc_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_documents TO authenticated;
GRANT ALL ON public.clinic_documents TO service_role;
ALTER TABLE public.clinic_documents ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS clinic_documents_updated ON public.clinic_documents;
CREATE TRIGGER clinic_documents_updated
  BEFORE UPDATE ON public.clinic_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Clinic docs client read" ON public.clinic_documents;
DROP POLICY IF EXISTS "Clinic docs admin all" ON public.clinic_documents;

CREATE POLICY "Clinic docs client read" ON public.clinic_documents
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR (auth.uid() = user_id AND public.clinic_approved())
  );

CREATE POLICY "Clinic docs admin write" ON public.clinic_documents
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-docs',
  'clinic-docs',
  false,
  20971520,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Clinic docs storage client read" ON storage.objects;
DROP POLICY IF EXISTS "Clinic docs storage admin insert" ON storage.objects;
DROP POLICY IF EXISTS "Clinic docs storage admin update" ON storage.objects;
DROP POLICY IF EXISTS "Clinic docs storage admin delete" ON storage.objects;

CREATE POLICY "Clinic docs storage client read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'clinic-docs'
    AND (
      public.is_admin()
      OR (
        public.clinic_approved()
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    )
  );

CREATE POLICY "Clinic docs storage admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'clinic-docs' AND public.is_admin());

CREATE POLICY "Clinic docs storage admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'clinic-docs' AND public.is_admin())
  WITH CHECK (bucket_id = 'clinic-docs' AND public.is_admin());

CREATE POLICY "Clinic docs storage admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'clinic-docs' AND public.is_admin());

-- Seed admin when account exists (safe no-op if not signed up yet)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = lower('rkeveyan@list.ru')
ON CONFLICT (user_id, role) DO NOTHING;
