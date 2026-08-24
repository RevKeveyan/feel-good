import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MEDIA_BUCKETS = ["avatars", "weekly-photos", "vision-board"] as const;

const USER_TABLES = [
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
] as const;

async function deleteTableRows(
  admin: SupabaseClient,
  table: string,
  column: string,
  userId: string,
) {
  const { error } = await admin.from(table).delete().eq(column, userId);
  if (error) {
    throw new Error(`Failed to delete ${table}: ${error.message}`);
  }
}

async function purgeUserStorage(admin: SupabaseClient, userId: string) {
  for (const bucket of MEDIA_BUCKETS) {
    const { data: entries, error: listError } = await admin.storage.from(bucket).list(userId, {
      limit: 1000,
      offset: 0,
    });
    if (listError) {
      throw new Error(`Failed to list ${bucket}/${userId}: ${listError.message}`);
    }
    if (!entries?.length) continue;

    const paths = entries.map((entry) => `${userId}/${entry.name}`);
    const { error: removeError } = await admin.storage.from(bucket).remove(paths);
    if (removeError) {
      throw new Error(`Failed to remove ${bucket} objects: ${removeError.message}`);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    await purgeUserStorage(supabaseAdmin, userId);

    for (const { table, column } of USER_TABLES) {
      await deleteTableRows(supabaseAdmin, table, column, userId);
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
