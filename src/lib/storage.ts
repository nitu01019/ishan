import { supabase, isSupabaseConfigured } from "./supabase";

export async function uploadFile(file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Storage not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${timestamp}_${random}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
