import { createClient } from "@supabase/supabase-js";

const projectRef = "bruvmdcstlkszvjruska";
const supabaseUrl = `https://${projectRef}.supabase.co`;

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token?.startsWith("sbp_")) {
  console.error("No SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const keysRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!keysRes.ok) {
  console.error("Failed to read API keys", keysRes.status, await keysRes.text());
  process.exit(1);
}
const keys = await keysRes.json();
const serviceKey =
  keys.find((k) => k.name === "service_role")?.api_key ??
  keys.find((k) => k.type === "secret")?.api_key;
const publishableKey =
  keys.find((k) => k.name === "anon")?.api_key ??
  keys.find((k) => k.name === "publishable")?.api_key ??
  keys.find((k) => String(k.name ?? "").toLowerCase().includes("publishable"))?.api_key ??
  keys.find((k) => String(k.api_key ?? "").startsWith("sb_publishable_"))?.api_key;

if (!serviceKey) {
  console.error("No service_role key");
  process.exit(1);
}

const sql = `
CREATE TABLE IF NOT EXISTS public.app_area_access (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  area text NOT NULL CHECK (area IN ('challenge', 'clinic')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  PRIMARY KEY (user_id, area)
);
GRANT SELECT, INSERT, UPDATE ON public.app_area_access TO authenticated;
GRANT ALL ON public.app_area_access TO service_role;
ALTER TABLE public.app_area_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members read own access" ON public.app_area_access;
CREATE POLICY "Members read own access" ON public.app_area_access
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage area approvals" ON public.app_area_access;
CREATE POLICY "Admins manage area approvals" ON public.app_area_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_area_access (user_id, area, status)
SELECT p.id, a.area,
  CASE
    WHEN a.area = 'challenge' AND coalesce(p.challenge_status, 'awaiting') = 'approved' THEN 'approved'
    WHEN a.area = 'challenge' AND coalesce(p.challenge_status, 'awaiting') = 'not_approved' THEN 'declined'
    WHEN a.area = 'clinic' AND coalesce(p.clinic_status, 'awaiting') = 'approved' THEN 'approved'
    WHEN a.area = 'clinic' AND coalesce(p.clinic_status, 'awaiting') = 'not_approved' THEN 'declined'
    ELSE 'pending'
  END
FROM public.profiles p
CROSS JOIN (VALUES ('challenge'), ('clinic')) AS a(area)
ON CONFLICT (user_id, area) DO UPDATE SET
  status = EXCLUDED.status;

CREATE OR REPLACE FUNCTION public.has_area_access(_area text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_area_access
    WHERE user_id = auth.uid() AND area = _area AND status = 'approved'
  );
$$;
REVOKE ALL ON FUNCTION public.has_area_access(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_area_access(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.request_area_access(_area text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR _area NOT IN ('challenge', 'clinic') THEN
    RAISE EXCEPTION 'Invalid access request';
  END IF;
  INSERT INTO public.app_area_access (user_id, area, status)
  VALUES (auth.uid(), _area, 'pending')
  ON CONFLICT (user_id, area) DO NOTHING;
  IF _area = 'challenge' THEN
    UPDATE public.profiles SET challenge_status = 'awaiting' WHERE id = auth.uid() AND challenge_status IS DISTINCT FROM 'approved';
  ELSIF _area = 'clinic' THEN
    UPDATE public.profiles SET clinic_status = 'awaiting' WHERE id = auth.uid() AND clinic_status IS DISTINCT FROM 'approved';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.request_area_access(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_area_access(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_profile_area_from_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.area = 'challenge' THEN
    UPDATE public.profiles SET challenge_status =
      CASE NEW.status WHEN 'approved' THEN 'approved' WHEN 'declined' THEN 'not_approved' ELSE 'awaiting' END
    WHERE id = NEW.user_id
      AND challenge_status IS DISTINCT FROM
        CASE NEW.status WHEN 'approved' THEN 'approved' WHEN 'declined' THEN 'not_approved' ELSE 'awaiting' END;
  ELSIF NEW.area = 'clinic' THEN
    UPDATE public.profiles SET clinic_status =
      CASE NEW.status WHEN 'approved' THEN 'approved' WHEN 'declined' THEN 'not_approved' ELSE 'awaiting' END
    WHERE id = NEW.user_id
      AND clinic_status IS DISTINCT FROM
        CASE NEW.status WHEN 'approved' THEN 'approved' WHEN 'declined' THEN 'not_approved' ELSE 'awaiting' END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_area_access_sync_profile ON public.app_area_access;
CREATE TRIGGER app_area_access_sync_profile
  AFTER INSERT OR UPDATE OF status ON public.app_area_access
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_area_from_access();

CREATE OR REPLACE FUNCTION public.sync_access_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.challenge_status IS DISTINCT FROM OLD.challenge_status THEN
    INSERT INTO public.app_area_access (user_id, area, status)
    VALUES (
      NEW.id,
      'challenge',
      CASE NEW.challenge_status WHEN 'approved' THEN 'approved' WHEN 'not_approved' THEN 'declined' ELSE 'pending' END
    )
    ON CONFLICT (user_id, area) DO UPDATE SET status = EXCLUDED.status
    WHERE public.app_area_access.status IS DISTINCT FROM EXCLUDED.status;
  END IF;
  IF TG_OP = 'INSERT' OR NEW.clinic_status IS DISTINCT FROM OLD.clinic_status THEN
    INSERT INTO public.app_area_access (user_id, area, status)
    VALUES (
      NEW.id,
      'clinic',
      CASE NEW.clinic_status WHEN 'approved' THEN 'approved' WHEN 'not_approved' THEN 'declined' ELSE 'pending' END
    )
    ON CONFLICT (user_id, area) DO UPDATE SET status = EXCLUDED.status
    WHERE public.app_area_access.status IS DISTINCT FROM EXCLUDED.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_area_access ON public.profiles;
CREATE TRIGGER profiles_sync_area_access
  AFTER INSERT OR UPDATE OF challenge_status, clinic_status ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_access_from_profile();

CREATE TABLE IF NOT EXISTS public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('pathology','treatment_plan')),
  storage_path text NOT NULL,
  file_name text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_documents TO authenticated;
GRANT ALL ON public.client_documents TO service_role;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own documents read" ON public.client_documents;
CREATE POLICY "Own documents read" ON public.client_documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage documents" ON public.client_documents;
CREATE POLICY "Admins manage documents" ON public.client_documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.client_documents (user_id, kind, storage_path, file_name, updated_at)
SELECT
  cd.user_id,
  CASE
    WHEN cd.doc_type = 'pathology' THEN 'pathology'
    ELSE 'treatment_plan'
  END,
  cd.storage_path,
  cd.doc_type || '.pdf',
  coalesce(cd.updated_at, now())
FROM public.clinic_documents cd
WHERE cd.doc_type IN ('pathology', 'treatment', 'supplements')
ON CONFLICT (user_id, kind) DO UPDATE SET
  storage_path = EXCLUDED.storage_path,
  file_name = EXCLUDED.file_name,
  updated_at = EXCLUDED.updated_at;
`;

const queryRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});
if (!queryRes.ok) {
  console.error("SQL failed", queryRes.status, await queryRes.text());
  process.exit(1);
}
const body = await queryRes.text();
console.log("Bridge SQL applied.");
if (body) console.log(body.slice(0, 500));

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { count: accessCount } = await admin
  .from("app_area_access")
  .select("*", { count: "exact", head: true });
console.log(`app_area_access rows: ${accessCount ?? "?"}`);

if (!publishableKey) {
  console.log("Could not resolve publishable key from API; keep using mobile .env value.");
} else {
  console.log("PUBLISHABLE_KEY=" + publishableKey);
}
console.log("SUPABASE_URL=" + supabaseUrl);
console.log("PROJECT_ID=" + projectRef);
