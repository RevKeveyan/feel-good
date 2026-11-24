import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const projectRef = "bruvmdcstlkszvjruska";
const supabaseUrl = `https://${projectRef}.supabase.co`;

const ADMIN_EMAIL = "management@networkco.net";
const ADMIN_PASSWORD = "Feel785231";
const CLIENT_EMAIL = "client@test.com";
const CLIENT_PASSWORD = "785231";
const REVIEW_EMAIL = "appstore.review@thefeelgoodsociety.com.au";
const REVIEW_NAME = "App Review";

const MEDIA_BUCKETS = ["avatars", "weekly-photos", "vision-board", "clinic-docs"];

const USER_TABLES = [
  { table: "clinic_documents", column: "user_id" },
  { table: "device_tokens", column: "user_id" },
  { table: "struggle_moments", column: "user_id" },
  { table: "weekly_photos", column: "user_id" },
  { table: "vision_board_items", column: "user_id" },
  { table: "transformation_wheel", column: "user_id" },
  { table: "onboarding_responses", column: "user_id" },
  { table: "daily_entries", column: "user_id" },
  { table: "testimonials", column: "user_id" },
  { table: "user_roles", column: "user_id" },
  { table: "profiles", column: "id" },
];

function daysAgoISO(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function generatePassword() {
  return `FgR-${randomBytes(18).toString("base64url")}`;
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

async function purgeUserStorage(admin, userId) {
  for (const bucket of MEDIA_BUCKETS) {
    const { data: entries, error: listError } = await admin.storage.from(bucket).list(userId, {
      limit: 1000,
      offset: 0,
    });
    if (listError) {
      console.warn(`storage list ${bucket}/${userId}: ${listError.message}`);
      continue;
    }
    if (!entries?.length) continue;
    const paths = entries.map((entry) => `${userId}/${entry.name}`);
    const { error: removeError } = await admin.storage.from(bucket).remove(paths);
    if (removeError) console.warn(`storage remove ${bucket}: ${removeError.message}`);
  }
}

async function wipeUser(admin, userId) {
  await purgeUserStorage(admin, userId);
  for (const { table, column } of USER_TABLES) {
    const { error } = await admin.from(table).delete().eq(column, userId);
    if (error) console.warn(`delete ${table}: ${error.message}`);
  }
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`deleteUser ${userId}: ${error.message}`);
}

async function createConfirmedUser(admin, { email, password, displayName }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user;
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token?.startsWith("sbp_")) {
  console.error("No SUPABASE_ACCESS_TOKEN. Run via scripts/reset-users-and-seed.ps1");
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

console.log("Listing users…");
const existing = await listAllUsers(admin);
console.log(`Found ${existing.length} auth users. Deleting…`);
for (const u of existing) {
  console.log(`- delete ${u.email ?? u.id}`);
  await wipeUser(admin, u.id);
}

const nowIso = new Date().toISOString();
const reviewPassword = generatePassword();
const reviewStart = daysAgoISO(54);

console.log("Creating management@networkco.net (admin)…");
const adminUser = await createConfirmedUser(admin, {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  displayName: "Management",
});
await admin.from("profiles").upsert(
  {
    id: adminUser.id,
    display_name: "Management",
    water_target_ml: 2500,
    challenge_start_date: daysAgoISO(0),
    challenge_status: "approved",
    clinic_status: "approved",
    onboarding_completed_at: nowIso,
  },
  { onConflict: "id" },
);
await admin.from("user_roles").upsert(
  { user_id: adminUser.id, role: "admin" },
  { onConflict: "user_id,role" },
);

console.log("Creating client@test.com…");
const clientUser = await createConfirmedUser(admin, {
  email: CLIENT_EMAIL,
  password: CLIENT_PASSWORD,
  displayName: "Test Client",
});
await admin.from("profiles").upsert(
  {
    id: clientUser.id,
    display_name: "Test Client",
    water_target_ml: 2500,
    challenge_start_date: daysAgoISO(0),
    challenge_status: "awaiting",
    clinic_status: "awaiting",
    onboarding_completed_at: null,
  },
  { onConflict: "id" },
);

console.log("Creating App Store review account…");
const reviewUser = await createConfirmedUser(admin, {
  email: REVIEW_EMAIL,
  password: reviewPassword,
  displayName: REVIEW_NAME,
});
await admin.from("profiles").upsert(
  {
    id: reviewUser.id,
    display_name: REVIEW_NAME,
    water_target_ml: 2500,
    challenge_start_date: reviewStart,
    challenge_status: "approved",
    clinic_status: "awaiting",
    onboarding_completed_at: nowIso,
  },
  { onConflict: "id" },
);
await admin.from("onboarding_responses").upsert(
  {
    user_id: reviewUser.id,
    goals: ["Feel healthier", "Build consistency"],
    why_joined: "App Store review demo account",
    why_change: "Demo",
    want_to_feel: "Energised and consistent",
    success_looks_like: "Daily habits completed",
    why_statement: "I show up for myself every day.",
    future_letter: "You finished the challenge. Be proud of the habits you built.",
    commitment_name: REVIEW_NAME,
    commitment_signed_at: nowIso,
    completed_at: nowIso,
  },
  { onConflict: "user_id" },
);
await admin.from("transformation_wheel").upsert(
  {
    user_id: reviewUser.id,
    phase: "day_1",
    energy: 5,
    confidence: 5,
    mood: 5,
    stress: 5,
    digestion: 5,
    fitness: 5,
    motivation: 5,
    consistency: 5,
    overall_health: 5,
    taken_at: nowIso,
  },
  { onConflict: "user_id,phase" },
);

console.log("");
console.log("=== SEEDED ACCOUNTS ===");
console.log(`Admin:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}  (admin role, both areas approved)`);
console.log(`Client:  ${CLIENT_EMAIL} / ${CLIENT_PASSWORD}  (both areas awaiting)`);
console.log(`Review:  ${REVIEW_EMAIL} / ${reviewPassword}`);
console.log(`         challenge approved, Day 55, onboarding done`);
console.log("=======================");
