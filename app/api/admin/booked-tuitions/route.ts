import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    requireRole(user, "admin");

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // e.g. "30", "7", "1"

    const query: Record<string, any> = {
      status: "accepted",
    };

    if (filter) {
      const days = parseInt(filter, 10);
      if (!isNaN(days) && days > 0) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        query.responded_at = { $gte: dateThreshold.toISOString() };
      }
    }

    const db = await getDb();
    const bookings = await db
      .collection("tuition_requests")
      .find(query, { projection: { _id: 0 } })
      .sort({ responded_at: -1, created_at: -1 })
      .limit(500)
      .toArray();

    return NextResponse.json(bookings);
  } catch (err: any) {
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Unauthorized"
        ? 401
        : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
