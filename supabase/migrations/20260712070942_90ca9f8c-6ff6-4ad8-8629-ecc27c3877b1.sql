
CREATE TABLE public.weekly_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_number int NOT NULL CHECK (week_number BETWEEN 1 AND 8),
  storage_path text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_photos TO authenticated;
GRANT ALL ON public.weekly_photos TO service_role;
ALTER TABLE public.weekly_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own weekly photos" ON public.weekly_photos FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER weekly_photos_updated_at BEFORE UPDATE ON public.weekly_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users read own weekly photos storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'weekly-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users insert own weekly photos storage" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'weekly-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own weekly photos storage" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'weekly-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own weekly photos storage" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'weekly-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
