import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, TablesInsert } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

/**
 * First-admin bootstrap: if no admins exist yet, grant admin to the caller.
 * Once an admin exists, this becomes a no-op and returns { granted: false }.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) return { granted: false as const };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { granted: true as const };
  });

export const listTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: "pending" | "approved" | "rejected" | "all" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const moderateTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["approve", "reject"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const status = data.action === "approve" ? "approved" : "rejected";
    const { error } = await context.supabase
      .from("testimonials")
      .update({
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, status };
  });

const MOCK_TESTIMONIALS = [
  {
    display_name: "Amelia R.",
    headline: "I feel like myself again",
    story:
      "55 days ago I was exhausted and foggy. Today I wake up before my alarm, walk every morning, and actually enjoy cooking. The small daily habits added up faster than I expected.",
    rating: 5,
  },
  {
    display_name: "Marcus T.",
    headline: "Sleep and mood both up",
    story:
      "The hardest part was week two. Once I stopped negotiating with myself each morning, everything else clicked. Mood is steadier, sleep is deeper, and I've dropped 4kg.",
    rating: 5,
  },
  {
    display_name: "Priya S.",
    headline: "Consistency finally stuck",
    story:
      "I've tried every wellness program. What worked this time was the tiny check-in each day. Not another to-do list — a nudge back to myself.",
    rating: 4,
  },
  {
    display_name: "Jonas K.",
    headline: "Down 6kg, up in energy",
    story:
      "The wheel comparison at Day 55 blew me away. Fitness went from 3 to 8. Confidence from 4 to 9. I'm not the same person who signed up.",
    rating: 5,
  },
  {
    display_name: "Leah W.",
    headline: "A gentle reset",
    story:
      "I needed something soft, not another bootcamp. The Feel Good Society met me where I was and walked with me. I'll be back for the next round.",
    rating: 5,
  },
];

export const seedMockData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uid = context.userId;

    // Wheel: day_1 (low) and day_55 (high) for the current admin user
    const wheelRows = [
      {
        user_id: uid,
        phase: "day_1",
        energy: 3, confidence: 4, mood: 4, stress: 7,
        digestion: 4, fitness: 3, motivation: 5, consistency: 3, overall_health: 4,
      },
      {
        user_id: uid,
        phase: "day_55",
        energy: 8, confidence: 9, mood: 8, stress: 3,
        digestion: 8, fitness: 8, motivation: 9, consistency: 9, overall_health: 9,
      },
    ];
    const { error: wErr } = await supabaseAdmin
      .from("transformation_wheel")
      .upsert(wheelRows, { onConflict: "user_id,phase" });
    if (wErr) throw new Error(wErr.message);

    // Testimonials: insert as current user with pending status
    const testimonialRows = MOCK_TESTIMONIALS.map((t) => ({
      user_id: uid,
      rating: t.rating,
      display_name: t.display_name,
      headline: t.headline,
      story: t.story,
      permission_to_publish: true,
      status: "pending",
    }));
    const { error: tErr, data: inserted } = await supabaseAdmin
      .from("testimonials")
      .insert(testimonialRows)
      .select("id");
    if (tErr) throw new Error(tErr.message);

    return {
      ok: true,
      wheelSeeded: wheelRows.length,
      testimonialsSeeded: inserted?.length ?? 0,
    };
  });

type MockUser = {
  email: string;
  displayName: string;
  dayOffset: number; // days since challenge start (challenge_start_date = today - dayOffset)
  wheels: Array<{
    phase: "day_1" | "day_55";
    values: Record<string, number>;
  }>;
  testimonials: Array<{
    headline: string;
    story: string;
    rating: number;
    status: "pending" | "approved" | "rejected";
    permission_to_publish?: boolean;
  }>;
};

const LOW = { energy: 3, confidence: 4, mood: 4, stress: 7, digestion: 4, fitness: 3, motivation: 5, consistency: 3, overall_health: 4 };
const HIGH = { energy: 8, confidence: 9, mood: 8, stress: 3, digestion: 8, fitness: 8, motivation: 9, consistency: 9, overall_health: 9 };

const MOCK_USERS: MockUser[] = [
  {
    email: "early.emma@fgs-mock.test",
    displayName: "Emma (Day 5)",
    dayOffset: 4,
    wheels: [{ phase: "day_1", values: LOW }],
    testimonials: [],
  },
  {
    email: "mid.marcus@fgs-mock.test",
    displayName: "Marcus (Day 30)",
    dayOffset: 29,
    wheels: [{ phase: "day_1", values: LOW }],
    testimonials: [],
  },
  {
    email: "almost.amelia@fgs-mock.test",
    displayName: "Amelia (Day 54)",
    dayOffset: 53,
    wheels: [{ phase: "day_1", values: LOW }],
    testimonials: [],
  },
  {
    email: "done.dana@fgs-mock.test",
    displayName: "Dana (Day 55, pending review)",
    dayOffset: 54,
    wheels: [{ phase: "day_1", values: LOW }, { phase: "day_55", values: HIGH }],
    testimonials: [
      {
        headline: "I feel like myself again",
        story: "55 days ago I was foggy and tired. Today I wake up before my alarm and actually enjoy cooking. The small daily habits added up faster than I expected.",
        rating: 5,
        status: "pending",
      },
    ],
  },
  {
    email: "veteran.vera@fgs-mock.test",
    displayName: "Vera (Day 70, approved)",
    dayOffset: 69,
    wheels: [{ phase: "day_1", values: LOW }, { phase: "day_55", values: HIGH }],
    testimonials: [
      {
        headline: "A gentle reset",
        story: "I needed something soft, not another bootcamp. The Feel Good Society met me where I was and walked with me. I'll be back for the next round.",
        rating: 5,
        status: "approved",
        permission_to_publish: true,
      },
    ],
  },
  {
    email: "private.pat@fgs-mock.test",
    displayName: "Pat (approved, private)",
    dayOffset: 60,
    wheels: [{ phase: "day_1", values: LOW }, { phase: "day_55", values: HIGH }],
    testimonials: [
      {
        headline: "Kept it to myself",
        story: "This one is approved by an admin but I asked not to publish. It should never appear on the public wall.",
        rating: 4,
        status: "approved",
        permission_to_publish: false,
      },
    ],
  },
  {
    email: "rejected.rob@fgs-mock.test",
    displayName: "Rob (rejected)",
    dayOffset: 60,
    wheels: [{ phase: "day_1", values: LOW }, { phase: "day_55", values: HIGH }],
    testimonials: [
      {
        headline: "spam link http://example.com",
        story: "This testimonial was rejected during moderation and must not surface publicly.",
        rating: 1,
        status: "rejected",
        permission_to_publish: true,
      },
    ],
  },
];

export const seedMultiUserMockData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const today = new Date();
    const summary: Array<{ email: string; day: number; created: boolean; testimonials: number; wheels: number }> = [];

    for (const mu of MOCK_USERS) {
      // Find or create the auth user
      let userId: string | null = null;
      const { data: listed } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
      const existing = listed?.users.find((u) => u.email?.toLowerCase() === mu.email.toLowerCase());
      let created = false;

      if (existing) {
        userId = existing.id;
      } else {
        const { data: cu, error: cErr } = await supabaseAdmin.auth.admin.createUser({
          email: mu.email,
          email_confirm: true,
          password: crypto.randomUUID() + "Aa1!",
          user_metadata: { display_name: mu.displayName, mock: true },
        });
        if (cErr) throw new Error(`createUser ${mu.email}: ${cErr.message}`);
        userId = cu.user!.id;
        created = true;
      }

      // Set challenge_start_date to align with dayOffset
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - mu.dayOffset);
      const startIso = startDate.toISOString().slice(0, 10);

      await supabaseAdmin
        .from("profiles")
        .upsert(
          { id: userId!, display_name: mu.displayName, challenge_start_date: startIso },
          { onConflict: "id" },
        );

      // Wheels
      if (mu.wheels.length > 0) {
        const rows: TablesInsert<"transformation_wheel">[] = mu.wheels.map((w) => ({
          user_id: userId!,
          phase: w.phase,
          confidence: w.values.confidence ?? 5,
          consistency: w.values.consistency ?? 5,
          digestion: w.values.digestion ?? 5,
          energy: w.values.energy ?? 5,
          fitness: w.values.fitness ?? 5,
          mood: w.values.mood ?? 5,
          motivation: w.values.motivation ?? 5,
          overall_health: w.values.overall_health ?? 5,
          stress: w.values.stress ?? 5,
        }));
        const { error } = await supabaseAdmin
          .from("transformation_wheel")
          .upsert(rows, { onConflict: "user_id,phase" });
        if (error) throw new Error(`wheel ${mu.email}: ${error.message}`);
      }

      // Testimonials — clear existing mock ones, then insert
      await supabaseAdmin.from("testimonials").delete().eq("user_id", userId!);
      if (mu.testimonials.length > 0) {
        const rows = mu.testimonials.map((t) => ({
          user_id: userId!,
          display_name: mu.displayName,
          headline: t.headline,
          story: t.story,
          rating: t.rating,
          status: t.status,
          permission_to_publish: t.permission_to_publish ?? true,
          moderated_at: t.status === "pending" ? null : new Date().toISOString(),
          moderated_by: t.status === "pending" ? null : context.userId,
        }));
        const { error } = await supabaseAdmin.from("testimonials").insert(rows);
        if (error) throw new Error(`testimonials ${mu.email}: ${error.message}`);
      }

      summary.push({
        email: mu.email,
        day: mu.dayOffset + 1,
        created,
        testimonials: mu.testimonials.length,
        wheels: mu.wheels.length,
      });
    }

    return { ok: true, users: summary };
  });

export const clearMockUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: listed } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    const mock = listed?.users.filter((u) => u.email?.endsWith("@fgs-mock.test")) ?? [];
    for (const u of mock) {
      await supabaseAdmin.auth.admin.deleteUser(u.id);
    }
    return { ok: true, deleted: mock.length };
  });

export const getPublicTestimonialsCheck = createServerFn({ method: "GET" })
  .handler(async () => {
    // Uses server publishable client to verify what anon can read
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await client
      .from("testimonials")
      .select("id, display_name, headline, story, rating, status, permission_to_publish")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/**
 * One-click end-to-end test: seed mock users, submit a fresh testimonial as
 * a Day 55 mock user, approve it, then verify anon visibility.
 */
export const runOneClickE2E = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const steps: Array<{ step: string; ok: boolean; detail: string }> = [];

    // 1. Ensure mock users exist (idempotent seed of Dana at Day 55)
    const today = new Date();
    const email = "e2e.dana@fgs-mock.test";
    const displayName = "Dana (E2E)";
    const { data: listed } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    let user = listed?.users.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      const { data: cu, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: crypto.randomUUID() + "Aa1!",
        user_metadata: { display_name: displayName, mock: true },
      });
      if (error) throw new Error(`createUser: ${error.message}`);
      user = cu.user!;
    }
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 54);
    await supabaseAdmin.from("profiles").upsert(
      { id: user!.id, display_name: displayName, challenge_start_date: startDate.toISOString().slice(0, 10) },
      { onConflict: "id" },
    );
    steps.push({ step: "seed", ok: true, detail: `Mock user ready (${email}, Day 55).` });

    // 2. Submit a fresh testimonial (pending)
    const marker = `e2e-${Date.now()}`;
    const headline = `E2E test — ${marker}`;
    const { data: inserted, error: iErr } = await supabaseAdmin
      .from("testimonials")
      .insert({
        user_id: user!.id,
        display_name: displayName,
        headline,
        story: "Automated end-to-end test story. Should become publicly visible after approval.",
        rating: 5,
        status: "pending",
        permission_to_publish: true,
      })
      .select("id")
      .single();
    if (iErr) throw new Error(`insert: ${iErr.message}`);
    steps.push({ step: "submit", ok: true, detail: `Submitted pending testimonial ${inserted!.id}.` });

    // 3. Approve it
    const { error: mErr } = await supabaseAdmin
      .from("testimonials")
      .update({
        status: "approved",
        moderated_at: new Date().toISOString(),
        moderated_by: context.userId,
      })
      .eq("id", inserted!.id);
    if (mErr) throw new Error(`approve: ${mErr.message}`);
    steps.push({ step: "approve", ok: true, detail: "Testimonial approved by admin." });

    // 4. Verify anon visibility (Day 55 gate — this user is Day 55+)
    const { createClient } = await import("@supabase/supabase-js");
    const anon = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: publicRows, error: pErr } = await anon
      .from("testimonials")
      .select("id, status, permission_to_publish")
      .eq("id", inserted!.id);
    if (pErr) throw new Error(`anon read: ${pErr.message}`);
    const visible = (publicRows ?? []).some(
      (r: any) => r.status === "approved" && r.permission_to_publish === true,
    );
    if (!visible) {
      steps.push({ step: "verify-public", ok: false, detail: "Approved testimonial NOT visible to anon." });
      return { ok: false, steps, testimonialId: inserted!.id };
    }
    steps.push({ step: "verify-public", ok: true, detail: "Approved testimonial visible to anonymous visitors." });

    // 5. Privacy sweep — no rejected/pending/private rows leak
    const { data: allPublic } = await anon
      .from("testimonials")
      .select("id, status, permission_to_publish");
    const leaks = (allPublic ?? []).filter(
      (r: any) => r.status !== "approved" || r.permission_to_publish !== true,
    );
    if (leaks.length > 0) {
      steps.push({ step: "privacy-sweep", ok: false, detail: `${leaks.length} row(s) leak to anon.` });
      return { ok: false, steps, testimonialId: inserted!.id };
    }
    steps.push({ step: "privacy-sweep", ok: true, detail: "No unapproved/private rows visible to anon." });

    return { ok: true, steps, testimonialId: inserted!.id };
  });

