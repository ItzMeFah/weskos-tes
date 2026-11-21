import { createClient } from "@supabase/supabase-js";
import { convertImageToWebP } from "@/lib/image-conversion";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** Upload an image to the public `weskos-media` bucket and return its URL. */
export async function uploadMedia(file: File, folder = "products") {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.");
  const webpFile = await convertImageToWebP(file);
  const safeName = webpFile.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("weskos-media").upload(path, webpFile, { cacheControl: "3600", upsert: false, contentType: "image/webp" });
  if (error) throw error;
  return supabase.storage.from("weskos-media").getPublicUrl(path).data.publicUrl;
}
