import { addAudit, getActor, OFFICE_SESSION_COOKIE } from "@/lib/backoffice-server";

export async function POST(request: Request) {
  const actor = await getActor(request);
  if (actor?.role === "office") await addAudit(actor, "office_logout");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${OFFICE_SESSION_COOKIE}=; Path=/backoffice; HttpOnly; SameSite=Strict; Max-Age=0${secure}` } });
}
