import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const db = await getDb();

    const teacher = await db
      .collection("teacher_profiles")
      .findOne({ id: body.teacher_id });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const doc = {
      id: crypto.randomUUID(),
      student_user_id: user.id,
      student_name: user.name,
      student_phone: user.phone || body.student_phone || "",
      teacher_user_id: teacher.user_id,
      teacher_profile_id: teacher.id,
      teacher_name: teacher.name,
      subject: body.subject,
      class_std: body.class_std,
      preferred_area: body.preferred_area,
      preferred_time: body.preferred_time || "",
      budget: body.budget ? Number(body.budget) : null,
      message: body.message || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    await db.collection("tuition_requests").insertOne(doc);

    return NextResponse.json(doc);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
