import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const saves = await db
      .collection("saved_tutors")
      .find({ user_id: user.id }, { projection: { _id: 0 } })
      .toArray();

    const ids = saves.map((s) => s.teacher_profile_id);
    const tutors = await db
      .collection("teacher_profiles")
      .find({ id: { $in: ids } }, { projection: { _id: 0, phone: 0, email: 0 } })
      .toArray();

    return NextResponse.json(tutors);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
