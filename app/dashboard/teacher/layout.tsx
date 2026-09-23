import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.role) {
    redirect("/onboarding/role");
  }

  // Only teacher role can access teacher dashboard
  if (user.role !== "teacher") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
