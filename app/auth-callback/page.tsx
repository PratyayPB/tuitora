import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const db = await getDb();
  let user = await db.collection("users").findOne({
    $or: [{ clerk_id: userId }, { id: userId }],
  });

  if (!user) {
    // Check if user exists by email (e.g. seeded accounts)
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress?.toLowerCase();

    if (email) {
      user = await db.collection("users").findOne({ email });
      if (user) {
        // Link clerk_id
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { clerk_id: userId, updated_at: new Date().toISOString() } }
        );
      }
    }
  }

  // Check if account has been blocked by admin
  if (user?.is_blocked) {
    redirect("/blocked");
  }

  // If user doesn't exist in DB or hasn't selected a role, direct to onboarding
  if (!user || !user.role) {
    redirect("/onboarding/role");
  }

  // Check role in DB and redirect accordingly
  if (user.role === "teacher") {
    redirect("/dashboard/teacher");
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin");
  }

  if (user.role === "student") {
    redirect("/dashboard/student");
  }

  // Fallback for any unknown role
  redirect("/onboarding/role");
}
