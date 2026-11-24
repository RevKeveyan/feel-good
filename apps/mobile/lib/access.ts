import type { AreaAccessStatus, Profile } from "@feelgood/shared";
import { supabase } from "@/lib/supabase";

export type AccessProfile = Pick<
  Profile,
  "id" | "display_name" | "challenge_status" | "clinic_status" | "onboarding_completed_at" | "challenge_start_date"
>;

export async function fetchAccessProfile(): Promise<AccessProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, challenge_status, clinic_status, onboarding_completed_at, challenge_start_date")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!data) return null;
  return normalizeAccessProfile(data as Record<string, unknown>, auth.user.id);
}

export function normalizeAccessProfile(
  row: Record<string, unknown>,
  fallbackId: string,
): AccessProfile {
  return {
    id: String(row.id ?? fallbackId),
    display_name: (row.display_name as string | null) ?? null,
    challenge_status: normalizeStatus(row.challenge_status),
    clinic_status: normalizeStatus(row.clinic_status),
    onboarding_completed_at: (row.onboarding_completed_at as string | null) ?? null,
    challenge_start_date: String(row.challenge_start_date ?? new Date().toISOString().slice(0, 10)),
  };
}

function normalizeStatus(value: unknown): AreaAccessStatus {
  if (value === "approved" || value === "not_approved" || value === "awaiting") return value;
  return "awaiting";
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: auth.user.id,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}

export async function requestAreaAccess(area: "challenge" | "clinic"): Promise<void> {
  const { error } = await supabase.rpc("request_area_access", { _area: area });
  if (error) throw new Error(error.message);
}
