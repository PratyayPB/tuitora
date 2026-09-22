"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Check } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingRolePage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, phone }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save profile role");
      }

      toast.success("Account setup complete!");
      
      // Redirect based on selected role
      if (role === "teacher") {
        router.push("/dashboard/tutor");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[color:var(--bg)]">
      <div className="bg-white rounded-3xl border border-[color:var(--border-earth)] p-8 sm:p-10 max-w-lg w-full shadow-sm">
        <div className="text-center mb-8">
          <div className="label-eyebrow">WELCOME TO TUITORA</div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[color:var(--ink)] mt-2">
            Are you a Student or Teacher?
          </h1>
          <p className="text-xs sm:text-sm text-[color:var(--ink-soft)] mt-2 max-w-sm mx-auto">
            Choose your account role so we can personalize your experience in Dibrugarh.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Card */}
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`relative p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                role === "student"
                  ? "border-[color:var(--terracotta)] bg-[color:var(--surface)] ring-2 ring-[color:var(--terracotta)]/20"
                  : "border-[color:var(--border-earth)] bg-white hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center transition-colors ${
                    role === "student"
                      ? "bg-[color:var(--terracotta)] text-white"
                      : "bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                  }`}
                >
                  <BookOpen size={20} />
                </div>
                {role === "student" && (
                  <div className="w-5 h-5 rounded-full bg-[color:var(--terracotta)] text-white grid place-items-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
              <div>
                <div className="font-display font-bold text-base text-[color:var(--ink)]">
                  Student / Parent
                </div>
                <div className="text-xs text-[color:var(--ink-soft)] mt-1 leading-relaxed">
                  Looking for verified home tutors in Dibrugarh
                </div>
              </div>
            </button>

            {/* Teacher Card */}
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`relative p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                role === "teacher"
                  ? "border-[color:var(--terracotta)] bg-[color:var(--surface)] ring-2 ring-[color:var(--terracotta)]/20"
                  : "border-[color:var(--border-earth)] bg-white hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center transition-colors ${
                    role === "teacher"
                      ? "bg-[color:var(--terracotta)] text-white"
                      : "bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                  }`}
                >
                  <GraduationCap size={20} />
                </div>
                {role === "teacher" && (
                  <div className="w-5 h-5 rounded-full bg-[color:var(--terracotta)] text-white grid place-items-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
              <div>
                <div className="font-display font-bold text-base text-[color:var(--ink)]">
                  Teacher / Tutor
                </div>
                <div className="text-xs text-[color:var(--ink-soft)] mt-1 leading-relaxed">
                  Offering home tuitions & coaching classes
                </div>
              </div>
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-[color:var(--ink)] block mb-1.5">
              Contact Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs sm:text-sm border border-[color:var(--border-earth)] rounded-xl p-3 outline-none focus:border-[color:var(--terracotta)] transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] text-white w-full py-5 font-semibold text-sm transition-all"
          >
            {submitting ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
