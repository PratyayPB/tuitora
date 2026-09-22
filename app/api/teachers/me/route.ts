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
    const profile = await db
      .collection("teacher_profiles")
      .findOne({ user_id: user.id }, { projection: { _id: 0 } });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not created yet" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
