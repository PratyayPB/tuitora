"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-5 bg-[color:var(--bg)]">
      <div className="max-w-md w-full bg-white border border-[color:var(--border-earth)] rounded-3xl p-8 sm:p-10 shadow-sm text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[color:var(--surface)] text-[color:var(--terracotta)] flex items-center justify-center mb-6 border border-[color:var(--border-earth)]">
          <ShieldAlert size={32} />
        </div>

        <div className="label-eyebrow mb-2">ACCESS RESTRICTED</div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-[color:var(--ink)] mb-3">
          Unauthorized Access
        </h1>

        <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed mb-8">
          You do not have permission to view or access this page. This area is
          restricted to accounts with appropriate role permissions.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button
            onClick={handleGoBack}
            className="w-full sm:flex-1 rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] text-white flex items-center justify-center gap-2 py-5"
          >
            <ArrowLeft size={16} /> Go Back
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:flex-1 rounded-full border-[color:var(--border-earth)] text-[color:var(--ink)] hover:bg-[color:var(--surface)] flex items-center justify-center gap-2 py-5"
          >
            <Link href="/dashboard">
              <Home size={16} /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
