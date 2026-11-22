import { createClient } from "@supabase/supabase-js";
import { convertImageToWebP } from "@/lib/image-conversion";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Keep the already-configured legacy key first when it exists; use the new key on newer projects.
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && publishableKey ? createClient(url, publishableKey) : null;

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
