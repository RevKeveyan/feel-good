import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

type UploadImageOptions = {
  bucket: string;
  path: string;
  uri: string;
  contentType?: string;
  upsert?: boolean;
};

export function guessImageContentType(uri: string, fallback = "image/jpeg"): string {
  const clean = uri.split("?")[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  return fallback;
}

export function cacheBustUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const stamp = Date.now();
  return url.includes("?") ? `${url}&t=${stamp}` : `${url}?t=${stamp}`;
}

export async function uploadLocalImage({
  bucket,
  path,
  uri,
  contentType,
  upsert = false,
}: UploadImageOptions) {
  const resolvedType = contentType ?? guessImageContentType(uri);
  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (e) {
    throw new Error(
      e instanceof Error ? `Could not read image: ${e.message}` : "Could not read image file",
    );
  }
  const body = decode(base64);
  const { data, error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType: resolvedType,
    upsert,
  });
  if (error) {
    throw new Error(error.message || "Storage upload failed");
  }
  return data;
}
