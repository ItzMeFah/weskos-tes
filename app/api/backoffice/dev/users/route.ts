import { addAudit, getBackofficeDb, jsonError, requireDev, hashPassword } from "@/lib/backoffice-server";

export async function GET(request: Request) {
  const actor = await requireDev(request);
  if (!actor) return jsonError("Dev access required.", 403);
  const db = getBackofficeDb();
  const [{ data, error }, devResult] = await Promise.all([
    db.from("backoffice_staff").select("id, username, is_active, last_login_at, password_changed_at, created_at, updated_at").order("created_at", { ascending: false }),
    db.from("admin_users").select("user_id, username, last_login_at, created_at").order("created_at", { ascending: false }),
  ]);
  if (error) return jsonError(`Could not load office users: ${error.message}`, 500);
  if (devResult.error) return jsonError(`Could not load Dev users: ${devResult.error.message}`, 500);
  const officeUsers = (data ?? []).map((user) => ({ ...user, role: "office" }));
  const devUsers = (devResult.data ?? []).map((user) => ({ id: user.user_id, username: user.username || user.user_id, is_active: true, last_login_at: user.last_login_at, created_at: user.created_at, updated_at: user.created_at, role: "dev" }));
  return Response.json({ users: [...devUsers, ...officeUsers] });
}

export async function POST(request: Request) {
  const actor = await requireDev(request);
  if (!actor) return jsonError("Dev access required.", 403);
  try {
    const body = await request.json() as { username?: string; password?: string };
    const username = body.username?.trim();
    if (!username || !/^[A-Za-z0-9._-]{3,40}$/.test(username)) return jsonError("Username must be 3–40 characters and use letters, numbers, dots, underscores, or hyphens.");
    if (!body.password || body.password.length < 10 || body.password.length > 256) return jsonError("Use a password with 10–256 characters.");
    const { data, error } = await getBackofficeDb().from("backoffice_staff").insert({ username, password_hash: hashPassword(body.password) }).select("id, username, is_active, last_login_at, created_at, updated_at").single();
    if (error) return jsonError(`Could not create user: ${error.message}`, 400);
    await addAudit(actor, "office_user_created", { userId: data.id, username });
    return Response.json({ user: data }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not create office user.", 500);
  }
}

export async function PATCH(request: Request) {
  const actor = await requireDev(request);
  if (!actor) return jsonError("Dev access required.", 403);
  try {
    const body = await request.json() as { id?: string; password?: string; is_active?: boolean };
    if (!body.id) return jsonError("Choose a user.");
    const db = getBackofficeDb();
    if (typeof body.password === "string") {
      if (body.password.length < 10 || body.password.length > 256) return jsonError("Use a password with 10–256 characters.");
      const now = new Date().toISOString();
      const { data, error } = await db.from("backoffice_staff").update({ password_hash: hashPassword(body.password), password_changed_at: now, updated_at: now }).eq("id", body.id).select("id").maybeSingle();
      if (error) return jsonError(`Could not reset password: ${error.message}`, 500);
      if (!data) return jsonError("Office user was not found.", 404);
      await addAudit(actor, "office_password_reset_by_dev", { userId: body.id });
    } else if (typeof body.is_active === "boolean") {
      const { data, error } = await db.from("backoffice_staff").update({ is_active: body.is_active, updated_at: new Date().toISOString() }).eq("id", body.id).select("id").maybeSingle();
      if (error) return jsonError(`Could not update user: ${error.message}`, 500);
      if (!data) return jsonError("Office user was not found.", 404);
      await addAudit(actor, body.is_active ? "office_user_enabled" : "office_user_disabled", { userId: body.id });
    } else return jsonError("Provide a new password or active state.");
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update office user.", 500);
  }
}
