CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
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
CREATE POLICY "Own documents read" ON public.client_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage documents" ON public.client_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER client_documents_updated BEFORE UPDATE ON public.client_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Clinic docs own read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'clinic-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Clinic docs admin all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'clinic-docs' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'clinic-docs' AND public.has_role(auth.uid(),'admin'));