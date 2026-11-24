import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const areaSchema = z.enum(["challenge", "clinic"]);

export const getAppAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [access, role] = await Promise.all([
      context.supabase.from("app_area_access").select("area, status").eq("user_id", context.userId),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if (access.error) throw new Error(access.error.message);
    if (role.error) throw new Error(role.error.message);
    return { access: access.data, isAdmin: role.data === true };
  });

export const checkAreaAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => areaSchema.parse(value))
  .handler(async ({ context, data }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_area_access", { _area: data });
    if (error) throw new Error(error.message);
    return allowed === true;
  });

export const requestAreaAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => areaSchema.parse(value))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("request_area_access", { _area: data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMemberAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !isAdmin) throw new Error("Forbidden: admin role required");
    const [profiles, access] = await Promise.all([
      context.supabase.from("profiles").select("id, display_name").order("created_at", { ascending: false }),
      context.supabase.from("app_area_access").select("user_id, area, status, requested_at"),
    ]);
    if (profiles.error) throw new Error(profiles.error.message);
    if (access.error) throw new Error(access.error.message);
    return { profiles: profiles.data, access: access.data };
  });

export const reviewMemberAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => z.object({ userId: z.string().uuid(), area: areaSchema, status: z.enum(["approved", "declined", "pending"]) }).parse(value))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !isAdmin) throw new Error("Forbidden: admin role required");
    const { error } = await context.supabase.from("app_area_access").upsert({
      user_id: data.userId, area: data.area, status: data.status,
      reviewed_by: context.userId, reviewed_at: new Date().toISOString(),
    }, { onConflict: "user_id,area" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });