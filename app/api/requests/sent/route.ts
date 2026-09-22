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
    const requests = await db
      .collection("tuition_requests")
      .find({ student_user_id: user.id }, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(200)
      .toArray();

    // Attach teacher phone if accepted
    for (const req of requests) {
      if (req.status === "accepted") {
        const teacher = await db
          .collection("teacher_profiles")
          .findOne(
            { id: req.teacher_profile_id },
            { projection: { _id: 0, phone: 1 } }
          );
        if (teacher) {
          req.teacher_phone = teacher.phone;
        }
      }
    }

    return NextResponse.json(requests);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
