import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { DIBRUGARH_AREAS } from "@/lib/constants";
import crypto from "crypto";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const reqDoc = await db
      .collection("student_requirements")
      .findOne({ user_id: user.id }, { projection: { _id: 0 } });

    return NextResponse.json(reqDoc);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.preferred_area && !DIBRUGARH_AREAS.includes(body.preferred_area)) {
      return NextResponse.json(
        { error: "Preferred area must be within Dibrugarh city areas" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = await db
      .collection("student_requirements")
      .findOne({ user_id: user.id });

    const now = new Date().toISOString();
    const data: any = {
      student_name: body.student_name || user.name,
      class_std: body.class_std || "Class 10",
      school_name: body.school_name || "",
      subjects: body.subjects || [],
      preferred_modes: body.preferred_modes || ["home"],
      preferred_area: body.preferred_area || DIBRUGARH_AREAS[0],
      preferred_time: body.preferred_time || "",
      budget_min: Number(body.budget_min || 0),
      budget_max: Number(body.budget_max || 0),
      description: body.description || "",
      user_id: user.id,
      updated_at: now,
    };

    if (existing) {
      data.id = existing.id;
      data.created_at = existing.created_at || now;
      await db
        .collection("student_requirements")
        .updateOne({ id: existing.id }, { $set: data });
    } else {
      data.id = crypto.randomUUID();
      data.created_at = now;
      await db.collection("student_requirements").insertOne(data);
    }

    delete data._id;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    await db
      .collection("student_requirements")
      .deleteOne({ user_id: user.id });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
