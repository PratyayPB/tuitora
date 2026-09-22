import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { DIBRUGARH_AREAS } from "@/lib/constants";

export async function GET() {
  try {
    const db = await getDb();
    const verifiedTutors = await db
      .collection("teacher_profiles")
      .countDocuments({ is_verified: true });
    const totalTutors = await db
      .collection("teacher_profiles")
      .countDocuments({});
    const students = await db
      .collection("users")
      .countDocuments({ role: "student" });
    const requests = await db
      .collection("tuition_requests")
      .countDocuments({});

    return NextResponse.json({
      verified_tutors: verifiedTutors,
      total_tutors: totalTutors,
      students: students,
      requests: requests,
      areas: DIBRUGARH_AREAS.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
