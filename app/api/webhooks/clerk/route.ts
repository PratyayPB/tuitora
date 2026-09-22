import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Please add CLERK_WEBHOOK_SECRET to .env" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Error occurred -- no svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const eventType = evt.type;
  const db = await getDb();

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address?.toLowerCase() || "";
    const name = `${first_name || ""} ${last_name || ""}`.trim() || email.split("@")[0] || "User";
    const phone = phone_numbers?.[0]?.phone_number || "";

    let role = (public_metadata?.role as string) || "student";
    if (email === "admin@dibrugarhtuition.in") {
      role = "admin";
    }

    await db.collection("users").updateOne(
      { $or: [{ clerk_id: id }, { email }] },
      {
        $set: {
          id: id,
          clerk_id: id,
          email,
          name,
          phone,
          role,
          updated_at: new Date().toISOString(),
        },
        $setOnInsert: {
          is_blocked: false,
          created_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await db.collection("users").deleteOne({ $or: [{ clerk_id: id }, { id }] });
      await db.collection("teacher_profiles").deleteOne({ user_id: id });
      await db.collection("student_requirements").deleteMany({ user_id: id });
    }
  }

  return NextResponse.json({ received: true });
}
