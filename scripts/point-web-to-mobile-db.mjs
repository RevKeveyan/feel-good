const projectRef = "bruvmdcstlkszvjruska";
const supabaseUrl = `https://${projectRef}.supabase.co`;
const publishableFromMobileEnv = "sb_publishable_6MvmGd6ZPw0tSRFBV4GvlQ_Ju3wdSDk";

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

const queryRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: `
      select area, status, count(*)::int as n from public.app_area_access group by 1,2 order by 1,2;
      select email from auth.users order by email;
    `,
  }),
});
console.log("verify", queryRes.status, await queryRes.text());

const fs = await import("node:fs");
const path = await import("node:path");
const envPath = path.join(process.cwd(), "web codebase", ".env");
const contents = `SUPABASE_PROJECT_ID="${projectRef}"
SUPABASE_PUBLISHABLE_KEY="${publishableFromMobileEnv}"
SUPABASE_URL="${supabaseUrl}"
SUPABASE_SERVICE_ROLE_KEY="${serviceKey}"
VITE_SUPABASE_PROJECT_ID="${projectRef}"
VITE_SUPABASE_PUBLISHABLE_KEY="${publishableFromMobileEnv}"
VITE_SUPABASE_URL="${supabaseUrl}"
`;
fs.writeFileSync(envPath, contents, "utf8");
console.log("Updated", envPath);
