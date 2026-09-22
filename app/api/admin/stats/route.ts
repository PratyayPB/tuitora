import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const user = await getCurrentUser();
    requireRole(user, "admin");

    const db = await getDb();
    const [
      totalUsers,
      students,
      teachers,
      verifiedTeachers,
      unverifiedTeachers,
      totalRequests,
      pendingReports,
    ] = await Promise.all([
      db.collection("users").countDocuments({}),
      db.collection("users").countDocuments({ role: "student" }),
      db.collection("users").countDocuments({ role: "teacher" }),
      db.collection("teacher_profiles").countDocuments({ is_verified: true }),
      db.collection("teacher_profiles").countDocuments({ is_verified: false }),
      db.collection("tuition_requests").countDocuments({}),
      db.collection("reports").countDocuments({ resolved: false }),
    ]);

    return NextResponse.json({
      total_users: totalUsers,
      students,
      teachers,
      verified_teachers: verifiedTeachers,
      unverified_teachers: unverifiedTeachers,
      total_requests: totalRequests,
      pending_reports: pendingReports,
    });
  } catch (err: any) {
    const status = err.message === "Forbidden" ? 403 : err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
