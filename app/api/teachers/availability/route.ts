import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { is_available } = await req.json();
    const db = await getDb();

    await db
      .collection("teacher_profiles")
      .updateOne(
        { user_id: user.id },
        { $set: { is_available: Boolean(is_available) } }
      );

    return NextResponse.json({ ok: true, is_available });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
