import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, phone } = await req.json();

    if (role && !["student", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const db = await getDb();
    const updateData: any = { updated_at: new Date().toISOString() };
    if (role && user.role !== "admin") updateData.role = role;
    if (phone) updateData.phone = phone;

    await db.collection("users").updateOne(
      { $or: [{ clerk_id: user.clerk_id }, { id: user.id }] },
      { $set: updateData }
    );

    return NextResponse.json({ ok: true, role: role || user.role });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
