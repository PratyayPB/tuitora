import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import AuthSync from "@/components/AuthSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuitora Dibrugarh | Verified Home & Online Tutors",
  description:
    "Find trusted, background-checked private tutors in Chowkidingee, Naliapool, Milan Nagar, and across Dibrugarh, Assam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[color:var(--bg)] text-[color:var(--ink)]">
        <ClerkProvider>
          <AuthSync />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
