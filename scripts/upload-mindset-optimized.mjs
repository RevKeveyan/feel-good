import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const projectRef = "bruvmdcstlkszvjruska";
const supabaseUrl = `https://${projectRef}.supabase.co`;
const bucket = "mindset-audio";
const sourceDir = path.join(process.cwd(), "mindset", "optimized");

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

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const files = (await readdir(sourceDir))
  .filter((f) => /^day-\d{2}\.mp3$/i.test(f))
  .sort();
if (!files.length) {
  console.error("No optimized mp3 files in", sourceDir);
  process.exit(1);
}

let total = 0;
for (const file of files) {
  const body = await readFile(path.join(sourceDir, file));
  total += body.length;
  console.log(`Uploading ${file} (${(body.length / 1024 / 1024).toFixed(2)} MB)`);
  const { error } = await admin.storage.from(bucket).upload(file, body, {
    contentType: "audio/mpeg",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) {
    console.error(`Failed ${file}:`, error.message);
    process.exit(1);
  }
}

console.log("");
console.log(`Uploaded ${files.length} optimized tracks, ${(total / 1024 / 1024).toFixed(1)} MB total`);
console.log(`BASE_URL=${supabaseUrl}/storage/v1/object/public/${bucket}`);
