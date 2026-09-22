import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teacher_profile_id } = params;
    const db = await getDb();

    const exists = await db.collection("saved_tutors").findOne({
      user_id: user.id,
      teacher_profile_id,
    });

    if (!exists) {
      await db.collection("saved_tutors").insertOne({
        id: crypto.randomUUID(),
        user_id: user.id,
        teacher_profile_id,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teacher_profile_id } = params;
    const db = await getDb();

    await db.collection("saved_tutors").deleteOne({
      user_id: user.id,
      teacher_profile_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
