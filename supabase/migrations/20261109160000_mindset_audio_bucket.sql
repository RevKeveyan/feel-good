INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mindset-audio',
  'mindset-audio',
  true,
  26214400,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/mpeg3']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read mindset audio" ON storage.objects;
CREATE POLICY "Public read mindset audio" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'mindset-audio');

DROP POLICY IF EXISTS "Service role manage mindset audio" ON storage.objects;
CREATE POLICY "Service role manage mindset audio" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'mindset-audio')
  WITH CHECK (bucket_id = 'mindset-audio');
