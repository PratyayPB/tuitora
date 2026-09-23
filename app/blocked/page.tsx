import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { UserDoc } from "@/lib/auth";
import BlockedClientView from "./BlockedClientView";

export const dynamic = "force-dynamic";

export default async function BlockedPage() {
  const { userId } = await auth();

  // 1. If user is not signed in and routes to /blocked, redirect them to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  const db = await getDb();
  let user: UserDoc | null = await db.collection<UserDoc>("users").findOne({
    $or: [{ clerk_id: userId }, { id: userId }],
  });

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress?.toLowerCase();
    if (email) {
      user = await db.collection<UserDoc>("users").findOne({ email });
    }
  }

  // 2. /blocked page can only be visited by users if they are blocked; else redirect to 404 (not found)
  if (!user || !user.is_blocked) {
    notFound();
  }

  const userEmail = user.email || "";

  return <BlockedClientView email={userEmail} />;
}
