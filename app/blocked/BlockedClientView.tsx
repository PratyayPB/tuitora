"use client";

import React from "react";
import { SignOutButton } from "@clerk/nextjs";
import { ShieldBan, Mail, LogOut, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlockedClientView({ email }: { email: string }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-5 bg-[color:var(--bg)]">
      <div className="max-w-lg w-full bg-white border border-[color:var(--border-earth)] rounded-3xl p-8 sm:p-12 shadow-sm text-center flex flex-col items-center">
        {/* Icon Header */}
        <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-6 border border-red-100 shadow-inner">
          <ShieldBan size={40} strokeWidth={2.2} />
        </div>

        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold tracking-wider uppercase mb-3">
          <AlertOctagon size={13} /> Account Suspended
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[color:var(--ink)] mb-3 tracking-tight">
          Your Account Has Been Blocked
        </h1>

        {/* Description */}
        <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed mb-6 max-w-sm">
          Access for <span className="font-semibold text-[color:var(--ink)]">{email || "your account"}</span> has been suspended by the Tuitora administration in Dibrugarh due to policy violations or verification reviews.
        </p>

        {/* Support Card */}
        <div className="w-full bg-[color:var(--surface)] border border-[color:var(--border-earth)] rounded-2xl p-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[color:var(--border-earth)] text-[color:var(--terracotta)] flex items-center justify-center shrink-0 mt-0.5">
              <Mail size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--ink)]">
                Think this is a mistake?
              </div>
              <p className="text-xs text-[color:var(--ink-soft)] mt-0.5 leading-normal">
                Contact our support team to request a review of your account status:
              </p>
              <a
                href="mailto:support@dibrugarhtuition.in?subject=Appeal%20Account%20Suspension"
                className="text-xs font-medium text-[color:var(--terracotta)] hover:underline inline-block mt-1.5"
              >
                support@dibrugarhtuition.in
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <SignOutButton redirectUrl="/">
            <Button
              variant="outline"
              className="w-full rounded-full border-[color:var(--border-earth)] text-[color:var(--ink)] hover:bg-[color:var(--surface)] hover:text-red-600 flex items-center justify-center gap-2 py-5 font-semibold text-sm transition-all cursor-pointer"
            >
              <LogOut size={16} /> Sign Out of Tuitora
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
