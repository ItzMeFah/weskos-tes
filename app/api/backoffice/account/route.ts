import { addAudit, getActor, getBackofficeDb, hashPassword, jsonError, verifyPassword } from "@/lib/backoffice-server";

export async function GET(request: Request) {
  const actor = await getActor(request);
  if (!actor || actor.role !== "office") return jsonError("Sign in as an office admin first.", 401);
  const { data, error } = await getBackofficeDb().from("backoffice_staff").select("id, username, last_login_at").eq("id", actor.id).maybeSingle();
  if (error || !data) return jsonError("Could not load the office account.", 500);
  return Response.json({ account: data });
}

export async function PATCH(request: Request) {
  const actor = await getActor(request);
  if (!actor || actor.role !== "office") return jsonError("Sign in as an office admin first.", 401);
  try {
    const body = await request.json() as { username?: string; currentPassword?: string; newPassword?: string };
    const db = getBackofficeDb();
    if (typeof body.username === "string") {
      const username = body.username.trim();
      if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) return jsonError("Username must be 3–40 characters and use letters, numbers, dots, underscores, or hyphens.");
      const { error } = await db.from("backoffice_staff").update({ username, updated_at: new Date().toISOString() }).eq("id", actor.id);
      if (error) return jsonError(`Could not save username: ${error.message}`, 400);
      await addAudit({ ...actor, username }, "office_username_changed");
      return Response.json({ ok: true, username });
    }
    if (typeof body.newPassword !== "string" || typeof body.currentPassword !== "string") return jsonError("Submit a username or both password fields.");
    if (body.newPassword.length < 10 || body.newPassword.length > 256) return jsonError("Use a new password with 10–256 characters.");
    if (body.currentPassword.length > 256) return jsonError("Current password is incorrect.", 401);
    const { data: account, error: readError } = await db.from("backoffice_staff").select("password_hash").eq("id", actor.id).maybeSingle();
    if (readError || !account || !verifyPassword(body.currentPassword, account.password_hash)) return jsonError("Current password is incorrect.", 401);
    const now = new Date().toISOString();
    const { error } = await db.from("backoffice_staff").update({ password_hash: hashPassword(body.newPassword), password_changed_at: now, updated_at: now }).eq("id", actor.id);
    if (error) return jsonError(`Could not change password: ${error.message}`, 500);
    await addAudit(actor, "office_password_changed");
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update the office account.", 500);
  }
}
