import { createClient } from "@supabase/supabase-js";

const projectRef = "tblafyztaidgwbrabajw";
const supabaseUrl = `https://${projectRef}.supabase.co`;

const ADMIN_EMAIL = "management@networkco.net";
const ADMIN_PASSWORD = "Feel785231";
const CLIENT_EMAIL = "client@test.com";
const CLIENT_PASSWORD = "785231";
const REVIEW_EMAIL = "appstore.review@thefeelgoodsociety.com.au";
const REVIEW_PASSWORD = "FeelGoodReview55!";

function daysAgoISO(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function listAllUsers(admin) {
  const users = [];
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    users.push(...(data?.users ?? []));
    if (!data?.users?.length || data.users.length < 200) break;
    page += 1;
  }
  return users;
}

async function upsertAuthUser(admin, { email, password, displayName }) {
  const existing = (await listAllUsers(admin)).find(
    (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error) throw new Error(`updateUser ${email}: ${error.message}`);
    return data.user;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user;
}

async function ensureProfile(admin, userId, displayName, challengeStart) {
  const nowIso = new Date().toISOString();
  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      display_name: displayName,
      water_target_ml: 2500,
      challenge_start_date: challengeStart,
      onboarding_completed_at: nowIso,
    },
    { onConflict: "id" },
  );
  if (error) console.warn(`profiles upsert: ${error.message}`);
}

async function ensureAreaAccess(admin, userId, challengeStatus, clinicStatus) {
  for (const [area, status] of [
    ["challenge", challengeStatus],
    ["clinic", clinicStatus],
  ]) {
    const { error } = await admin.from("app_area_access").upsert(
      { user_id: userId, area, status },
      { onConflict: "user_id,area" },
    );
    if (error) console.warn(`app_area_access ${area}: ${error.message}`);
  }
}

async function ensureAdminRole(admin, userId) {
  const { error } = await admin.from("user_roles").upsert(
    { user_id: userId, role: "admin" },
    { onConflict: "user_id,role" },
  );
  if (error) console.warn(`user_roles: ${error.message}`);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token?.startsWith("sbp_")) {
  console.error("No SUPABASE_ACCESS_TOKEN. Run via scripts/seed-web-matching-users.ps1");
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
  console.error("No service_role key found");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`Seeding matching auth users on ${projectRef}…`);

const adminUser = await upsertAuthUser(admin, {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  displayName: "Management",
});
await ensureProfile(admin, adminUser.id, "Management", daysAgoISO(0));
await ensureAdminRole(admin, adminUser.id);
await ensureAreaAccess(admin, adminUser.id, "approved", "approved");
console.log(`OK ${ADMIN_EMAIL}`);

const clientUser = await upsertAuthUser(admin, {
  email: CLIENT_EMAIL,
  password: CLIENT_PASSWORD,
  displayName: "Test Client",
});
await ensureProfile(admin, clientUser.id, "Test Client", daysAgoISO(0));
await ensureAreaAccess(admin, clientUser.id, "pending", "pending");
console.log(`OK ${CLIENT_EMAIL}`);

const reviewUser = await upsertAuthUser(admin, {
  email: REVIEW_EMAIL,
  password: REVIEW_PASSWORD,
  displayName: "App Review",
});
await ensureProfile(admin, reviewUser.id, "App Review", daysAgoISO(54));
await ensureAreaAccess(admin, reviewUser.id, "approved", "pending");
console.log(`OK ${REVIEW_EMAIL}`);

console.log("");
console.log("=== SAME LOGINS ON WEB + MOBILE ===");
console.log(`Admin:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
console.log(`Client: ${CLIENT_EMAIL} / ${CLIENT_PASSWORD}`);
console.log(`Review: ${REVIEW_EMAIL} / ${REVIEW_PASSWORD}`);
console.log("Note: data stays separate (two Supabase projects). Only auth emails/passwords match.");
console.log("===================================");
