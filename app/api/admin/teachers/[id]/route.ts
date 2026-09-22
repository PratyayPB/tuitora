import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    requireRole(user, "admin");

    const { id } = params;
    const db = await getDb();
    await db.collection("teacher_profiles").deleteOne({ id });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err.message === "Forbidden" ? 403 : err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
