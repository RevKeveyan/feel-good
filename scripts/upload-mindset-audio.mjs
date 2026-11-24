import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const projectRef = "bruvmdcstlkszvjruska";
const supabaseUrl = `https://${projectRef}.supabase.co`;
const bucket = "mindset-audio";
const sourceDir = path.join(process.cwd(), "mindset");

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
if (!serviceKey) {
  console.error("No service_role key");
  process.exit(1);
}

const sql = `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  '${bucket}',
  '${bucket}',
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
  USING (bucket_id = '${bucket}');

DROP POLICY IF EXISTS "Service role manage mindset audio" ON storage.objects;
CREATE POLICY "Service role manage mindset audio" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = '${bucket}')
  WITH CHECK (bucket_id = '${bucket}');
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
  console.error("Bucket SQL failed", queryRes.status, await queryRes.text());
  process.exit(1);
}
console.log("Bucket ready:", bucket);

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const files = await readdir(sourceDir);
const mp3s = files.filter((f) => /^TFGS - Mindset - Day\d+\.mp3$/i.test(f));
if (!mp3s.length) {
  console.error("No mindset mp3 files found in", sourceDir);
  process.exit(1);
}

mp3s.sort((a, b) => {
  const da = Number(a.match(/Day(\d+)/i)?.[1] ?? 0);
  const db = Number(b.match(/Day(\d+)/i)?.[1] ?? 0);
  return da - db;
});

for (const file of mp3s) {
  const day = Number(file.match(/Day(\d+)/i)?.[1]);
  if (!day || day < 1 || day > 21) {
    console.warn("Skip unexpected file:", file);
    continue;
  }
  const objectName = `day-${String(day).padStart(2, "0")}.mp3`;
  const body = await readFile(path.join(sourceDir, file));
  console.log(`Uploading ${file} → ${objectName} (${(body.length / 1024 / 1024).toFixed(1)} MB)`);
  const { error } = await admin.storage.from(bucket).upload(objectName, body, {
    contentType: "audio/mpeg",
    upsert: true,
  });
  if (error) {
    console.error(`Failed ${objectName}:`, error.message);
    process.exit(1);
  }
}

const baseUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}`;
console.log("");
console.log("BASE_URL=" + baseUrl);
console.log(`Uploaded ${mp3s.length} tracks.`);
