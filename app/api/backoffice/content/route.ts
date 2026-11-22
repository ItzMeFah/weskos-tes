import { addAudit, getActor, getBackofficeDb, jsonError } from "@/lib/backoffice-server";

function changedPaths(before: unknown, after: unknown, prefix = ""): string[] {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (!before || !after || typeof before !== "object" || typeof after !== "object" || Array.isArray(before) || Array.isArray(after)) return [prefix || "homepage"];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].flatMap((key) => changedPaths((before as Record<string, unknown>)[key], (after as Record<string, unknown>)[key], prefix ? `${prefix}.${key}` : key)).slice(0, 200);
}

export async function GET(request: Request) {
  const actor = await getActor(request);
  if (!actor) return jsonError("Sign in to the backoffice first.", 401);
  const { data, error } = await getBackofficeDb().from("site_content").select("content, updated_at").eq("id", "home").maybeSingle();
  if (error) return jsonError(`Could not load homepage content: ${error.message}`, 500);
  return Response.json({ content: data?.content ?? {}, updatedAt: data?.updated_at ?? null });
}

export async function PUT(request: Request) {
  const actor = await getActor(request);
  if (!actor) return jsonError("Sign in to the backoffice first.", 401);
  try {
    const { content } = await request.json() as { content?: unknown };
    if (!content || typeof content !== "object" || Array.isArray(content)) return jsonError("Homepage content is invalid.");
    const db = getBackofficeDb();
    const { data: existing } = await db.from("site_content").select("content").eq("id", "home").maybeSingle();
    const updatedAt = new Date().toISOString();
    const { error } = await db.from("site_content").upsert({ id: "home", content, updated_at: updatedAt });
    if (error) return jsonError(`Could not save homepage: ${error.message}`, 500);
    const fields = changedPaths(existing?.content ?? {}, content);
    await addAudit(actor, "homepage_saved", { fields });
    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save homepage.", 500);
  }
}
