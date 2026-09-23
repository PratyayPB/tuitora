import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentRootLayout({
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

  // Only student role can access /dashboard/student/*
  if (user.role !== "student") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
