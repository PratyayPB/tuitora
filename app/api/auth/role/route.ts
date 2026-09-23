import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { DIBRUGARH_AREAS } from "@/lib/constants";
import crypto from "crypto";

function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // Clean non-digits (like +91, spaces, dashes) or check standard format
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 13;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, phone, teacherProfile } = body;

    if (!role || !["student", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Please select a valid role (Student or Teacher)" }, { status: 400 });
    }

    // Role == student validation: Phone number is mandatory & must be valid
    if (role === "student") {
      if (!phone || !isValidPhone(phone)) {
        return NextResponse.json(
          { error: "A valid phone number (at least 10 digits) is required for student registration." },
          { status: 400 }
        );
      }
    }

    // Role == teacher validation: Phone and all Teacher Profile attributes mandatory
    if (role === "teacher") {
      if (!phone || !isValidPhone(phone)) {
        return NextResponse.json(
          { error: "A valid phone number (at least 10 digits) is required for teacher registration." },
          { status: 400 }
        );
      }

      if (!teacherProfile || typeof teacherProfile !== "object") {
        return NextResponse.json(
          { error: "Teacher profile details are required." },
          { status: 400 }
        );
      }

      const {
        name,
        qualification,
        experience_years,
        location_area,
        subjects,
        classes,
        tuition_modes,
      } = teacherProfile;

      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Display name is required for teacher profile." },
          { status: 400 }
        );
      }

      if (!qualification || typeof qualification !== "string" || !qualification.trim()) {
        return NextResponse.json(
          { error: "Highest qualification is required." },
          { status: 400 }
        );
      }

      if (
        experience_years === undefined ||
        experience_years === null ||
        isNaN(Number(experience_years)) ||
        Number(experience_years) < 0
      ) {
        return NextResponse.json(
          { error: "Teaching experience in years is required and must be 0 or greater." },
          { status: 400 }
        );
      }

      if (!location_area || !DIBRUGARH_AREAS.includes(location_area)) {
        return NextResponse.json(
          { error: "Please select a valid locality in Dibrugarh." },
          { status: 400 }
        );
      }

      if (!Array.isArray(subjects) || subjects.length === 0) {
        return NextResponse.json(
          { error: "Please select at least one subject you teach." },
          { status: 400 }
        );
      }

      if (!Array.isArray(classes) || classes.length === 0) {
        return NextResponse.json(
          { error: "Please select at least one target class." },
          { status: 400 }
        );
      }

      if (!Array.isArray(tuition_modes) || tuition_modes.length === 0) {
        return NextResponse.json(
          { error: "Please select at least one tuition mode." },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const now = new Date().toISOString();

    // 1. Update user record (role, phone)
    const updateUserData: any = {
      phone: phone.trim(),
      updated_at: now,
    };
    if (user.role !== "admin") {
      updateUserData.role = role;
    }

    await db.collection("users").updateOne(
      { $or: [{ clerk_id: user.clerk_id }, { id: user.id }] },
      { $set: updateUserData }
    );

    // 2. If teacher, create / update teacher_profile
    if (role === "teacher") {
      const existingProfile = await db
        .collection("teacher_profiles")
        .findOne({ user_id: user.id });

      const profileDoc: any = {
        name: teacherProfile.name.trim(),
        qualification: teacherProfile.qualification.trim(),
        subjects: teacherProfile.subjects,
        classes: teacherProfile.classes,
        experience_years: Number(teacherProfile.experience_years),
        location_area: teacherProfile.location_area,
        tuition_modes: teacherProfile.tuition_modes,
        fee_per_month: teacherProfile.fee_per_month ? Number(teacherProfile.fee_per_month) : 3000,
        fee_per_hour: teacherProfile.fee_per_hour ? Number(teacherProfile.fee_per_hour) : null,
        availability_days: teacherProfile.availability_days || ["Mon", "Tue", "Wed", "Thu", "Fri"],
        availability_time: teacherProfile.availability_time || "5:00 PM - 8:00 PM",
        description: teacherProfile.description || "",
        photo_url: teacherProfile.photo_url || null,
        user_id: user.id,
        email: user.email,
        phone: phone.trim(),
        updated_at: now,
      };

      if (existingProfile) {
        profileDoc.id = existingProfile.id;
        profileDoc.is_verified = existingProfile.is_verified || false;
        profileDoc.is_available =
          existingProfile.is_available !== undefined
            ? existingProfile.is_available
            : true;
        profileDoc.created_at = existingProfile.created_at || now;

        await db
          .collection("teacher_profiles")
          .updateOne({ id: existingProfile.id }, { $set: profileDoc });
      } else {
        profileDoc.id = crypto.randomUUID();
        profileDoc.is_verified = false;
        profileDoc.is_available = true;
        profileDoc.created_at = now;

        await db.collection("teacher_profiles").insertOne(profileDoc);
      }
    }

    return NextResponse.json({ ok: true, role: role || user.role });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
