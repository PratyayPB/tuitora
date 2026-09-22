import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await getDb();
    const profile = await db
      .collection("teacher_profiles")
      .findOne({ id }, { projection: { _id: 0 } });

    if (!profile) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const user = await getCurrentUser();

    // Hide phone & email unless viewer is:
    // 1. The teacher themselves
    // 2. An admin
    // 3. A student with an accepted request for this teacher
    let canSeeContact = false;

    if (user) {
      if (user.id === profile.user_id || user.role === "admin") {
        canSeeContact = true;
      } else {
        const acceptedRequest = await db.collection("tuition_requests").findOne({
          student_user_id: user.id,
          teacher_user_id: profile.user_id,
          status: "accepted",
        });
        if (acceptedRequest) {
          canSeeContact = true;
        }
      }
    }

    if (!canSeeContact) {
      delete profile.phone;
      delete profile.email;
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
