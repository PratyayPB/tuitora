import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "./mongodb";

export interface UserDoc {
  _id?: any;
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  phone?: string;
  role: "student" | "teacher" | "admin" | null;
  is_blocked: boolean;
  created_at: string;
  updated_at?: string;
}

export async function getCurrentUser(): Promise<UserDoc | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const db = await getDb();
  let user: UserDoc | null = await db.collection<UserDoc>("users").findOne({
    $or: [{ clerk_id: userId }, { id: userId }],
  });

  if (!user) {
    // Sync user details from Clerk automatically
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email =
      clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() || "";
    const name =
      clerkUser.fullName ||
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      email.split("@")[0] ||
      "User";
    const phone = clerkUser.phoneNumbers[0]?.phoneNumber || "";

    // Determine initial role: Check publicMetadata, or leave null for onboarding
    // If the email is admin@dibrugarhtuition.in or has admin metadata, make admin
    let role: "student" | "teacher" | "admin" | null = null;
    if (
      email === "admin@dibrugarhtuition.in" ||
      clerkUser.publicMetadata?.role === "admin"
    ) {
      role = "admin";
    } else if (clerkUser.publicMetadata?.role === "teacher") {
      role = "teacher";
    }

    const newUser: UserDoc = {
      id: userId,
      clerk_id: userId,
      email,
      name,
      phone,
      role,
      is_blocked: false,
      created_at: new Date().toISOString(),
    };

    // Check if an account already exists with this email (e.g. from previous JWT legacy seed)
    const existingByEmail = await db
      .collection<UserDoc>("users")
      .findOne({ email });

    if (existingByEmail) {
      await db
        .collection<UserDoc>("users")
        .updateOne(
          { _id: existingByEmail._id as any },
          { $set: { clerk_id: userId, updated_at: new Date().toISOString() } }
        );
      user = { ...existingByEmail, clerk_id: userId };
    } else {
      await db.collection("users").insertOne(newUser as any);
      user = newUser;
    }
  }

  if (user?.is_blocked) {
    redirect("/blocked");
  }

  return user;
}

export function requireRole(user: UserDoc | null, ...allowedRoles: string[]) {
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}
