import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    requireRole(user, "admin");

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const blocked = body.blocked !== undefined ? Boolean(body.blocked) : true;

    const db = await getDb();
    await db
      .collection("users")
      .updateOne({ id }, { $set: { is_blocked: blocked } });

    return NextResponse.json({ ok: true, is_blocked: blocked });
  } catch (err: any) {
    const status = err.message === "Forbidden" ? 403 : err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
