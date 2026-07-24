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

export async function uploadLocalImage({
  bucket,
  path,
  uri,
  contentType = "image/jpeg",
  upsert = false,
}: UploadImageOptions) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const body = decode(base64);
  const { data, error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType,
    upsert,
  });
  if (error) throw error;
  return data;
}
