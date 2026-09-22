import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "User synchronized successfully with MongoDB",
      user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to synchronize user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
