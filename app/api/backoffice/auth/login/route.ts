import { addAudit, createOfficeSession, getBackofficeDb, jsonError, OFFICE_SESSION_COOKIE, verifyPassword } from "@/lib/backoffice-server";
import { isValidOfficeLoginName } from "@/lib/backoffice-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    const username = body.username?.trim();
    const password = body.password ?? "";
    if (!username || !password) return jsonError("Enter your username and password.", 400);
    if (password.length > 256) return jsonError("Username or password is incorrect.", 401);
    if (!isValidOfficeLoginName(username)) return jsonError("Username/email or password is incorrect.", 401);
    const db = getBackofficeDb();
    const { data: user, error } = await db.from("backoffice_staff").select("id, username, password_hash, is_active").ilike("username", username).maybeSingle();
    if (error) return jsonError("Could not check the office account. Run the backoffice setup SQL.", 503);
    if (!user) return jsonError("No office account was found.", 404);
    if (!user.is_active || !verifyPassword(password, user.password_hash)) return jsonError("Username/email or password is incorrect.", 401);
    const actor = { role: "office" as const, id: user.id as string, username: user.username as string };
    const { error: updateError } = await db.from("backoffice_staff").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
    if (updateError) return jsonError("Sign-in succeeded but the login timestamp could not be recorded. Try again.", 503);
    await addAudit(actor, "office_login");
    const token = createOfficeSession(actor);
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return Response.json({ role: "office", username: user.username }, { headers: { "Set-Cookie": `${OFFICE_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${secure}` } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Office sign-in failed.", 503);
  }
}
