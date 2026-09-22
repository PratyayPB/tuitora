import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardRedirect() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin");
  }

  if (user.role === "teacher") {
    redirect("/dashboard/tutor");
  }

  // Default to student
  redirect("/dashboard/student");
}
