import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { privacyPolicy, termsOfService } from "../packages/shared/src/legal-content.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "docs", "legal", "web");
const projectRef = "bruvmdcstlkszvjruska";
const supabaseUrl = `https://${projectRef}.supabase.co`;

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderDoc(doc) {
  const sections = doc.sections
    .map((section) => {
      const parts = [];
      if (section.heading) parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
      for (const p of section.paragraphs ?? []) {
        parts.push(`<p>${escapeHtml(p)}</p>`);
      }
      if (section.bullets?.length) {
        parts.push(
          `<ul>${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`,
        );
      }
      return parts.join("\n");
    })
    .join("\n");

  const intro = doc.intro.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(doc.title)} — The Feel Good Challenge</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; line-height: 1.55; max-width: 42rem; margin: 2rem auto; padding: 0 1.25rem; color: #1a1a1a; background: #f7f3ee; }
    h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.15rem; margin-top: 1.75rem; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
    ul { padding-left: 1.25rem; }
    a { color: #2f5d50; }
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title)}</h1>
  <p class="meta">Last updated: ${escapeHtml(doc.lastUpdated)}</p>
  ${intro}
  ${sections}
  <p class="meta"><a href="https://thefeelgoodsociety.com.au/">thefeelgoodsociety.com.au</a> · <a href="mailto:hello@thefeelgoodsociety.com.au">hello@thefeelgoodsociety.com.au</a></p>
</body>
</html>
`;
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token?.startsWith("sbp_")) {
  console.error("No SUPABASE_ACCESS_TOKEN. Run via scripts/publish-legal-pages.ps1");
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
  keys.find((k) => k.type === "secret")?.api_key ??
  keys.find((k) => String(k.name ?? "").toLowerCase().includes("service"))?.api_key;

if (!serviceKey) {
  console.error("No service_role key. Keys:", keys.map((k) => ({ name: k.name, type: k.type })));
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const supportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Support — The Feel Good Challenge</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; line-height: 1.55; max-width: 42rem; margin: 2rem auto; padding: 0 1.25rem; color: #1a1a1a; background: #f7f3ee; }
    h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.15rem; margin-top: 1.75rem; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
    a { color: #2f5d50; }
  </style>
</head>
<body>
  <h1>Support</h1>
  <p class="meta">The Feel Good Challenge · The Feel Good Society Pty Ltd</p>
  <p>Need help with the app, your account, or the 55-day challenge?</p>
  <h2>Contact</h2>
  <p>Email: <a href="mailto:hello@thefeelgoodsociety.com.au">hello@thefeelgoodsociety.com.au</a></p>
  <p>We aim to reply within 5 business days.</p>
  <h2>Account deletion</h2>
  <p>In the iOS or Android app: open <strong>Settings</strong> → <strong>Delete account</strong>. You can also email us to request deletion.</p>
  <h2>Legal</h2>
  <p><a href="./privacy.html">Privacy Policy</a> · <a href="./terms.html">Terms of Service</a></p>
  <p class="meta"><a href="https://thefeelgoodsociety.com.au/">thefeelgoodsociety.com.au</a></p>
</body>
</html>
`;

const files = [
  { name: "privacy.html", body: renderDoc(privacyPolicy) },
  { name: "terms.html", body: renderDoc(termsOfService) },
  { name: "support.html", body: supportHtml },
];

for (const f of files) {
  writeFileSync(join(outDir, f.name), f.body);
}

const bucketsRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
  headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
});
if (!bucketsRes.ok) {
  console.error("list buckets failed", bucketsRes.status, await bucketsRes.text());
  process.exit(1);
}
const buckets = await bucketsRes.json();
if (!buckets.some((b) => b.name === "legal")) {
  const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "legal",
      name: "legal",
      public: true,
      file_size_limit: 1_000_000,
      allowed_mime_types: ["text/html"],
    }),
  });
  if (!createRes.ok) {
    console.error("create bucket failed", createRes.status, await createRes.text());
    process.exit(1);
  }
}

for (const f of files) {
  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/legal/${f.name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "text/html",
      "x-upsert": "true",
      "cache-control": "3600",
    },
    body: f.body,
  });
  if (!uploadRes.ok) {
    console.error("upload failed", f.name, uploadRes.status, await uploadRes.text());
    process.exit(1);
  }
}

console.log("OK");
console.log(`privacy ${supabaseUrl}/storage/v1/object/public/legal/privacy.html`);
console.log(`terms ${supabaseUrl}/storage/v1/object/public/legal/terms.html`);
console.log(`support ${supabaseUrl}/storage/v1/object/public/legal/support.html`);
