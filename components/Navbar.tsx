"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, GraduationCap, Menu, X } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          data-testid="nav-logo"
          className="flex items-center gap-2 z-50"
        >
          <div className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-[color:var(--terracotta)] grid place-items-center text-white">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
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
              className="flex items-center gap-1.5 text-sm font-medium hover:text-[color:var(--terracotta)] transition-colors text-[color:var(--ink)] mr-1 min-h-[44px]"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <UserButton
              userProfileMode="modal"
              appearance={{
                elements: {
                  avatarBox:
                    "h-9 w-9 ring-2 ring-[color:var(--border-earth)] hover:ring-[color:var(--terracotta)] transition-all",
                  userButtonTrigger:
                    "focus:outline-none min-h-[44px] flex items-center",
                },

                layout: { unsafe_disableDevelopmentModeWarnings: true },
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center gap-2 z-50">
          <SignedIn>
            <UserButton
              userProfileMode="modal"
              appearance={{
                elements: {
                  avatarBox:
                    "h-9 w-9 ring-2 ring-[color:var(--border-earth)] hover:ring-[color:var(--terracotta)] transition-all",
                  userButtonTrigger:
                    "focus:outline-none min-h-[44px] flex items-center",
                },
              }}
            />
          </SignedIn>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[color:var(--ink)] hover:text-[color:var(--terracotta)] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-[color:var(--border-earth)] shadow-lg py-4 px-4 flex flex-col gap-4 md:hidden z-40">
          <SignedOut>
            <SignInButton
              mode="modal"
              fallbackRedirectUrl="/auth-callback"
              forceRedirectUrl="/auth-callback"
            >
              <Button
                variant="outline"
                className="w-full justify-center min-h-[44px] text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding/role">
              <Button
                className="w-full justify-center min-h-[44px] text-base rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-base font-medium hover:text-[color:var(--terracotta)] transition-colors text-[color:var(--ink)] min-h-[44px] px-2 rounded-lg hover:bg-neutral-50"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
          </SignedIn>
        </div>
      )}
    </nav>
  );
}
