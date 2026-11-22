import { getActor, jsonError } from "@/lib/backoffice-server";

export async function GET(request: Request) {
  try {
    const actor = await getActor(request);
    if (!actor || actor.role !== "office") return jsonError("Not signed in as office admin.", 401);
    return Response.json({ actor });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not read the office session.", 503);
  }
}
