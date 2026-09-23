import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
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

  // Only users with role "admin" can access the admin dashboard
  if (user.role !== "admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
