import { randomUUID } from "node:crypto";
import { addAudit, getActor, getBackofficeDb, jsonError } from "@/lib/backoffice-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await getActor(request);
  if (!actor) return jsonError("Sign in to the backoffice first.", 401);
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Choose a photo first.");
    if (file.type !== "image/webp") return jsonError("Photo uploads must be converted to WebP first.");
    if (file.size > 10 * 1024 * 1024) return jsonError("Photo must be 10 MB or smaller.");
    const name = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/\.webp$/, "") || "photo";
    const path = `home/${randomUUID()}-${name}.webp`;
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length < 12 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") return jsonError("The uploaded file is not a valid WebP image.");
    const db = getBackofficeDb();
    const { error } = await db.storage.from("weskos-media").upload(path, bytes, { cacheControl: "3600", upsert: false, contentType: "image/webp" });
    if (error) return jsonError(`Photo upload failed: ${error.message}`, 500);
    const url = db.storage.from("weskos-media").getPublicUrl(path).data.publicUrl;
    await addAudit(actor, "photo_uploaded", { path });
    return Response.json({ url });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Photo upload failed.", 500);
  }
}
