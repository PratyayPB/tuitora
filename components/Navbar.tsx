"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, GraduationCap } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" data-testid="nav-logo" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[color:var(--terracotta)] grid place-items-center text-white">
            <GraduationCap size={18} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-black text-[16px] tracking-tight">
              Tuitora
            </div>
            <div className="label-eyebrow !text-[9px] !tracking-[0.3em]">
              DIBRUGARH
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton
              mode="modal"
              fallbackRedirectUrl="/auth-callback"
              forceRedirectUrl="/auth-callback"
            >
              <Button variant="ghost" size="sm" data-testid="nav-login-btn">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding/role">
              <Button
                size="sm"
                data-testid="nav-signup-btn"
                className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)]"
              >
                Sign up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              data-testid="nav-dashboard"
              className="flex items-center gap-1.5 text-sm font-medium hover:text-[color:var(--terracotta)] transition-colors text-[color:var(--ink)] mr-1"
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <UserButton
              userProfileMode="modal"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-[color:var(--border-earth)] hover:ring-[color:var(--terracotta)] transition-all",
                  userButtonTrigger: "focus:outline-none",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
