import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type BackofficeActor = { role: "dev" | "office"; id: string; username: string };
export const OFFICE_SESSION_COOKIE = "weskos-office-session";

let serverClient: SupabaseClient | null = null;
export function getBackofficeDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) throw new Error("Server Supabase credentials are not configured (SUPABASE_SECRET_KEY).");
  if (!serverClient) serverClient = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return serverClient;
}

function sessionSecret() {
  const configuredSecret = process.env.BACKOFFICE_SESSION_SECRET;
  if (configuredSecret) {
    if (configuredSecret.length < 32) throw new Error("BACKOFFICE_SESSION_SECRET must be at least 32 characters.");
    return configuredSecret;
  }
  const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serverKey) throw new Error("Set SUPABASE_SECRET_KEY to enable office sessions.");
  return createHmac("sha256", serverKey).update("weskos-office-session-signing-key-v1").digest("hex");
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createOfficeSession(actor: BackofficeActor) {
  const payload = Buffer.from(JSON.stringify({ ...actor, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyOfficeSession(token: string | undefined): BackofficeActor | null {
  if (!token) return null;
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return null;
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as BackofficeActor & { exp?: number };
    if (parsed.role !== "office" || !parsed.id || !parsed.username || !parsed.exp || parsed.exp < Date.now()) return null;
    return { role: "office", id: parsed.id, username: parsed.username };
  } catch {
    return null;
  }
}

export async function getActor(request: Request): Promise<BackofficeActor | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${OFFICE_SESSION_COOKIE}=`))?.slice(OFFICE_SESSION_COOKIE.length + 1);
  const officeActor = verifyOfficeSession(cookie ? decodeURIComponent(cookie) : undefined);
  if (officeActor) {
    try {
      const { data } = await getBackofficeDb().from("backoffice_staff").select("username, is_active").eq("id", officeActor.id).maybeSingle();
      if (data?.is_active) return { ...officeActor, username: data.username };
    } catch {
      return null;
    }
    return null;
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7);
  try {
    const db = getBackofficeDb();
    const { data: authData, error: authError } = await db.auth.getUser(token);
    if (authError || !authData.user) return null;
    const { data: devRow, error } = await db.from("admin_users").select("user_id, username").eq("user_id", authData.user.id).maybeSingle();
    if (error || !devRow) return null;
    return { role: "dev", id: authData.user.id, username: devRow.username || authData.user.email || "Dev" };
  } catch {
    return null;
  }
}

export async function requireDev(request: Request) {
  const actor = await getActor(request);
  return actor?.role === "dev" ? actor : null;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, expectedHex, extra] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex || extra) return false;
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function addAudit(actor: BackofficeActor, action: string, details: Record<string, unknown> = {}) {
  const { error } = await getBackofficeDb().from("backoffice_audit").insert({ actor_role: actor.role, actor_id: actor.id, actor_username: actor.username, action, details });
  if (error) console.error("Backoffice audit write failed:", error.message);
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
