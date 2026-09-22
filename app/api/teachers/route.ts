import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { DIBRUGARH_AREAS } from "@/lib/constants";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const subject = searchParams.get("subject");
    const classStd = searchParams.get("class_std");
    const area = searchParams.get("area");
    const mode = searchParams.get("mode");
    const minFee = searchParams.get("min_fee");
    const maxFee = searchParams.get("max_fee");
    const minExperience = searchParams.get("min_experience");
    const verifiedOnly = searchParams.get("verified_only") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const filter: any = {};
    if (verifiedOnly) {
      filter.is_verified = true;
    }
    if (subject) {
      filter.subjects = { $regex: new RegExp(`^${subject}$`, "i") };
    }
    if (classStd) {
      filter.classes = classStd;
    }
    if (area) {
      filter.location_area = area;
    }
    if (mode) {
      filter.tuition_modes = mode;
    }
    if (minFee) {
      filter.fee_per_month = { ...(filter.fee_per_month || {}), $gte: parseInt(minFee, 10) };
    }
    if (maxFee) {
      filter.fee_per_month = { ...(filter.fee_per_month || {}), $lte: parseInt(maxFee, 10) };
    }
    if (minExperience) {
      filter.experience_years = { $gte: parseInt(minExperience, 10) };
    }
    if (q) {
      const qRegex = { $regex: q, $options: "i" };
      filter.$or = [
        { name: qRegex },
        { qualification: qRegex },
        { description: qRegex },
        { subjects: qRegex },
      ];
    }

    const db = await getDb();
    const docs = await db
      .collection("teacher_profiles")
      .find(filter, { projection: { _id: 0, phone: 0, email: 0 } })
      .limit(limit)
      .toArray();

    return NextResponse.json(docs);
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

    if (body.location_area && !DIBRUGARH_AREAS.includes(body.location_area)) {
      return NextResponse.json(
        { error: "Location must be within Dibrugarh city areas" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Ensure user role is updated to teacher
    if (user.role !== "teacher" && user.role !== "admin") {
      await db.collection("users").updateOne(
        { $or: [{ clerk_id: user.clerk_id }, { id: user.id }] },
        { $set: { role: "teacher" } }
      );
      user.role = "teacher";
    }

    const existing = await db
      .collection("teacher_profiles")
      .findOne({ user_id: user.id });

    const now = new Date().toISOString();
    const profileData: any = {
      name: body.name || user.name,
      qualification: body.qualification || "",
      subjects: body.subjects || [],
      classes: body.classes || [],
      experience_years: Number(body.experience_years || 0),
      location_area: body.location_area || DIBRUGARH_AREAS[0],
      tuition_modes: body.tuition_modes || ["home"],
      fee_per_month: Number(body.fee_per_month || 0),
      fee_per_hour: body.fee_per_hour ? Number(body.fee_per_hour) : null,
      availability_days: body.availability_days || [],
      availability_time: body.availability_time || "",
      description: body.description || "",
      photo_url: body.photo_url || null,
      user_id: user.id,
      email: user.email,
      phone: body.phone || user.phone || "",
      updated_at: now,
    };

    if (existing) {
      profileData.id = existing.id;
      profileData.is_verified = existing.is_verified || false;
      profileData.is_available =
        existing.is_available !== undefined ? existing.is_available : true;
      profileData.created_at = existing.created_at || now;

      await db
        .collection("teacher_profiles")
        .updateOne({ id: existing.id }, { $set: profileData });
    } else {
      profileData.id = crypto.randomUUID();
      profileData.is_verified = false;
      profileData.is_available = true;
      profileData.created_at = now;

      await db.collection("teacher_profiles").insertOne(profileData);
    }

    delete profileData._id;
    return NextResponse.json(profileData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
