import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";
import { formatUploadError } from "./upload-image";

const MAX_PDF_BYTES = 20 * 1024 * 1024;

export async function uploadClinicPdf(opts: {
  userId: string;
  docType: string;
  uri: string;
}): Promise<string> {
  const path = `${opts.userId}/${opts.docType}.pdf`;
  const info = await FileSystem.getInfoAsync(opts.uri);
  if (!info.exists) throw new Error("File not found");
  if (typeof info.size === "number" && info.size > MAX_PDF_BYTES) {
    throw new Error("PDF must be under 20 MB");
  }

  const base64 = await FileSystem.readAsStringAsync(opts.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const { error } = await supabase.storage.from("clinic-docs").upload(path, decode(base64), {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(formatUploadError(error, "Could not upload PDF"));

  const { error: rowError } = await supabase.from("clinic_documents").upsert(
    {
      user_id: opts.userId,
      doc_type: opts.docType,
      storage_path: path,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,doc_type" },
  );
  if (rowError) throw new Error(rowError.message || "Could not save document record");
  return path;
}
