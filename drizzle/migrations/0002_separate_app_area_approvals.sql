CREATE TABLE public.app_area_access (
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
CREATE POLICY "Members read own access" ON public.app_area_access FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage area approvals" ON public.app_area_access FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.app_area_access (user_id, area, status) SELECT id, area, 'pending' FROM public.profiles CROSS JOIN (VALUES ('challenge'), ('clinic')) AS areas(area);
CREATE FUNCTION public.has_area_access(_area text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.app_area_access WHERE user_id = auth.uid() AND area = _area AND status = 'approved');
$$;
REVOKE ALL ON FUNCTION public.has_area_access(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_area_access(text) TO authenticated;
CREATE FUNCTION public.request_area_access(_area text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR _area NOT IN ('challenge', 'clinic') THEN RAISE EXCEPTION 'Invalid access request'; END IF;
  INSERT INTO public.app_area_access (user_id, area, status) VALUES (auth.uid(), _area, 'pending') ON CONFLICT (user_id, area) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.request_area_access(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_area_access(text) TO authenticated;
CREATE POLICY "Challenge approval gate" ON public.daily_entries AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_area_access('challenge')) WITH CHECK (public.has_area_access('challenge'));
CREATE POLICY "Challenge approval gate" ON public.onboarding_responses AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_area_access('challenge')) WITH CHECK (public.has_area_access('challenge'));
CREATE POLICY "Challenge approval gate" ON public.vision_board_items AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_area_access('challenge')) WITH CHECK (public.has_area_access('challenge'));
CREATE POLICY "Challenge approval gate" ON public.weekly_photos AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_area_access('challenge')) WITH CHECK (public.has_area_access('challenge'));
CREATE POLICY "Challenge approval gate" ON public.struggle_moments AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_area_access('challenge')) WITH CHECK (public.has_area_access('challenge'));
CREATE POLICY "Challenge approval gate" ON public.transformation_wheel AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_area_access('challenge') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')) WITH CHECK (public.has_area_access('challenge'));
CREATE POLICY "Challenge testimonial submission gate" ON public.testimonials AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.has_area_access('challenge'));
CREATE POLICY "Clinic approval gate" ON public.client_documents AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_area_access('clinic') OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "App area file approval gate" ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated USING (
  CASE WHEN bucket_id = 'clinic-docs' THEN public.has_area_access('clinic') OR public.has_role(auth.uid(), 'admin')
       WHEN bucket_id IN ('weekly-photos', 'vision-board') THEN public.has_area_access('challenge')
       ELSE true END
) WITH CHECK (
  CASE WHEN bucket_id = 'clinic-docs' THEN public.has_role(auth.uid(), 'admin')
       WHEN bucket_id IN ('weekly-photos', 'vision-board') THEN public.has_area_access('challenge')
       ELSE true END
);