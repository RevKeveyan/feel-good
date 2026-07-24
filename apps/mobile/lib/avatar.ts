import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { cacheBustUrl } from "./upload-image";

export function getGoogleAvatarUrl(user: User | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;
  if (fromMeta) return fromMeta;

  const identities = user.identities ?? [];
  for (const identity of identities) {
    if (identity.provider !== "google") continue;
    const data = identity.identity_data ?? {};
    const url =
      (typeof data.avatar_url === "string" && data.avatar_url) ||
      (typeof data.picture === "string" && data.picture) ||
      null;
    if (url) return url;
  }
  return null;
}

export async function resolveAvatarUrl(options: {
  avatarPath: string | null | undefined;
  user: User | null | undefined;
  cacheBust?: boolean;
}): Promise<string | null> {
  const { avatarPath, user, cacheBust = true } = options;
  if (avatarPath) {
    const { data, error } = await supabase.storage.from("avatars").createSignedUrl(avatarPath, 3600);
    if (error || !data?.signedUrl) return getGoogleAvatarUrl(user);
    return cacheBust ? cacheBustUrl(data.signedUrl) : data.signedUrl;
  }
  return getGoogleAvatarUrl(user);
}
