import { addAudit, getBackofficeDb, jsonError, requireDev } from "@/lib/backoffice-server";

export async function GET(request: Request) {
  const actor = await requireDev(request);
  if (!actor) return jsonError("Dev access required.", 403);
  const { data, error } = await getBackofficeDb().from("backoffice_audit").select("id, actor_role, actor_username, action, details, created_at").order("created_at", { ascending: false }).limit(250);
  if (error) return jsonError(`Could not load audit history: ${error.message}`, 500);
  return Response.json({ logs: data ?? [] });
}

export async function POST(request: Request) {
  const actor = await requireDev(request);
  if (!actor) return jsonError("Dev access required.", 403);
  const body = await request.json().catch(() => ({})) as { action?: string };
  const action = body.action === "dev_logout" ? "dev_logout" : "dev_login";
  if (action === "dev_login") {
    const { error } = await getBackofficeDb().from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("user_id", actor.id);
    if (error) return jsonError(`Could not record Dev login: ${error.message}`, 500);
  }
  await addAudit(actor, action);
  return Response.json({ ok: true });
}
