import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const projectRef = "bruvmdcstlkszvjruska";
const supabaseUrl = `https://${projectRef}.supabase.co`;
const REVIEW_EMAIL = "appstore.review@thefeelgoodsociety.com.au";
const REVIEW_NAME = "App Review";

function daysAgoISO(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function generatePassword() {
  return `FgR-${randomBytes(18).toString("base64url")}`;
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token?.startsWith("sbp_")) {
  console.error("No SUPABASE_ACCESS_TOKEN. Run via scripts/provision-app-review-account.ps1");
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

const password = generatePassword();
const startDate = daysAgoISO(54);
const nowIso = new Date().toISOString();

const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
if (list.error) {
  console.error("listUsers failed", list.error.message);
  process.exit(1);
}

let user = list.data.users.find((u) => u.email?.toLowerCase() === REVIEW_EMAIL.toLowerCase());

if (user) {
  const updated = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: { display_name: REVIEW_NAME },
    ban_duration: "none",
  });
  if (updated.error) {
    console.error("updateUser failed", updated.error.message);
    process.exit(1);
  }
  user = updated.data.user;
  console.log("Updated existing auth user", user.id);
} else {
  const created = await admin.auth.admin.createUser({
    email: REVIEW_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { display_name: REVIEW_NAME },
  });
  if (created.error) {
    console.error("createUser failed", created.error.message);
    process.exit(1);
  }
  user = created.data.user;
  console.log("Created auth user", user.id);
}

const { error: profileError } = await admin.from("profiles").upsert(
  {
    id: user.id,
    display_name: REVIEW_NAME,
    water_target_ml: 2500,
    challenge_start_date: startDate,
    onboarding_completed_at: nowIso,
  },
  { onConflict: "id" },
);
if (profileError) {
  console.error("profiles upsert failed", profileError.message);
  process.exit(1);
}

const { error: onboardingError } = await admin.from("onboarding_responses").upsert(
  {
    user_id: user.id,
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
if (onboardingError) {
  console.error("onboarding_responses upsert failed", onboardingError.message);
  process.exit(1);
}

const { error: wheelError } = await admin.from("transformation_wheel").upsert(
  {
    user_id: user.id,
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
if (wheelError) {
  console.error("transformation_wheel upsert failed", wheelError.message);
  process.exit(1);
}

console.log("");
console.log("=== APP STORE REVIEW DEMO ACCOUNT (copy password into Connect only) ===");
console.log(`Email: ${REVIEW_EMAIL}`);
console.log(`Password: ${password}`);
console.log(`challenge_start_date: ${startDate} (Day 55)`);
console.log(`user_id: ${user.id}`);
console.log("======================================================================");
console.log("");
console.log("Password does not expire and does not require change on first login.");
