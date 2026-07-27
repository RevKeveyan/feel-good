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

export function formatUploadError(e: unknown, fallback = "Something went wrong"): string {
  if (e instanceof Error && e.message.trim()) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (typeof e === "string" && e.trim()) return e;
  return fallback;
}

export function extensionForContentType(contentType: string, fallback = "jpg"): string {
  const t = contentType.toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  if (t.includes("gif")) return "gif";
  if (t.includes("heic")) return "heic";
  if (t.includes("heif")) return "heif";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  return fallback;
}

export function guessImageContentType(uri: string, fallback = "image/jpeg"): string {
  const clean = uri.split("?")[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".heic")) return "image/heic";
  if (clean.endsWith(".heif")) return "image/heif";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  return fallback;
}

export function cacheBustUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const stamp = Date.now();
  return url.includes("?") ? `${url}&t=${stamp}` : `${url}?t=${stamp}`;
}

function needsCacheCopy(uri: string): boolean {
  const lower = uri.toLowerCase();
  return (
    lower.startsWith("content://") ||
    lower.startsWith("ph://") ||
    lower.startsWith("assets-library://") ||
    lower.startsWith("ph-upload://")
  );
}

async function resolveReadableUri(uri: string, contentType: string): Promise<string> {
  if (!needsCacheCopy(uri)) {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) return uri;
    } catch {
      // fall through to copy
    }
  }

  const base = FileSystem.cacheDirectory;
  if (!base) {
    throw new Error("Image cache is unavailable on this device");
  }
  const ext = extensionForContentType(contentType);
  const dest = `${base}upload-${Date.now()}.${ext}`;
  try {
    await FileSystem.copyAsync({ from: uri, to: dest });
  } catch (e) {
    throw new Error(
      `Could not prepare image for upload: ${formatUploadError(e, "copy failed")}`,
    );
  }
  return dest;
}

export async function uploadLocalImage({
  bucket,
  path,
  uri,
  contentType,
  upsert = false,
}: UploadImageOptions) {
  const resolvedType = contentType ?? guessImageContentType(uri);
  const readableUri = await resolveReadableUri(uri, resolvedType);

  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(readableUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (e) {
    throw new Error(`Could not read image: ${formatUploadError(e, "read failed")}`);
  }

  if (!base64) {
    throw new Error("Image file is empty");
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
