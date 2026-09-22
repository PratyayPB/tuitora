import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const user = await getCurrentUser();
    requireRole(user, "admin");

    const db = await getDb();
    const users = await db
      .collection("users")
      .find({}, { projection: { _id: 0, password_hash: 0 } })
      .limit(500)
      .toArray();

    return NextResponse.json(users);
  } catch (err: any) {
    const status = err.message === "Forbidden" ? 403 : err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
