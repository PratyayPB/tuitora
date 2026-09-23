"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Check } from "lucide-react";
import {
  CLASSES,
  SUBJECTS,
  MODES,
  DAYS,
  QUALIFICATIONS,
  DIBRUGARH_AREAS,
} from "@/lib/constants";
import { toast } from "sonner";

export default function OnboardingRolePage() {
  const router = useRouter();
  const { user } = useUser();

  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Teacher Profile form state
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState(QUALIFICATIONS[0]);
  const [experienceYears, setExperienceYears] = useState<number | string>(3);
  const [locationArea, setLocationArea] = useState(DIBRUGARH_AREAS[0]);
  const [areas, setAreas] = useState<string[]>(DIBRUGARH_AREAS);
  const [subjects, setSubjects] = useState<string[]>(["Mathematics"]);
  const [classes, setClasses] = useState<string[]>(["Class 10"]);
  const [tuitionModes, setTuitionModes] = useState<string[]>(["home"]);

  // Optional teacher profile fields with sensible defaults matching dashboard
  const [feePerMonth, setFeePerMonth] = useState<number | string>(3000);
  const [feePerHour, setFeePerHour] = useState<number | string>("");
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [availabilityTime, setAvailabilityTime] = useState("5:00 PM - 8:00 PM");
  const [description, setDescription] = useState("");

  // Sync user display name if available
  useEffect(() => {
    if (user?.fullName && !name) {
      setName(user.fullName);
    }
  }, [user, name]);

  // Fetch areas
  useEffect(() => {
    fetch("/api/meta/areas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAreas(data);
          if (!locationArea) setLocationArea(data[0]);
        }
      })
      .catch(() => {});
  }, [locationArea]);

  const toggleSubject = (s: string) => {
    if (subjects.includes(s)) {
      setSubjects(subjects.filter((x) => x !== s));
    } else {
      setSubjects([...subjects, s]);
    }
  };

  const toggleClass = (c: string) => {
    if (classes.includes(c)) {
      setClasses(classes.filter((x) => x !== c));
    } else {
      setClasses([...classes, c]);
    }
  };

  const toggleMode = (m: string) => {
    if (tuitionModes.includes(m)) {
      setTuitionModes(tuitionModes.filter((x) => x !== m));
    } else {
      setTuitionModes([...tuitionModes, m]);
    }
  };

  const toggleDay = (d: string) => {
    if (availabilityDays.includes(d)) {
      setAvailabilityDays(availabilityDays.filter((x) => x !== d));
    } else {
      setAvailabilityDays([...availabilityDays, d]);
    }
  };

  const validatePhone = (num: string): boolean => {
    const digits = num.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select whether you are a Student or Teacher");
      return;
    }

    if (!phone || !validatePhone(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    let payload: any = {
      role,
      phone: phone.trim(),
    };

    if (role === "teacher") {
      if (!name.trim()) {
        toast.error("Please enter your display name");
        return;
      }
      if (!qualification) {
        toast.error("Please select your highest qualification");
        return;
      }
      if (experienceYears === "" || Number(experienceYears) < 0) {
        toast.error("Please enter valid teaching experience in years");
        return;
      }
      if (!locationArea) {
        toast.error("Please select your locality in Dibrugarh");
        return;
      }
      if (subjects.length === 0) {
        toast.error("Please select at least one subject you teach");
        return;
      }
      if (classes.length === 0) {
        toast.error("Please select at least one target class");
        return;
      }
      if (tuitionModes.length === 0) {
        toast.error("Please select at least one tuition mode");
        return;
      }

      payload.teacherProfile = {
        name: name.trim(),
        qualification,
        experience_years: Number(experienceYears),
        location_area: locationArea,
        subjects,
        classes,
        tuition_modes: tuitionModes,
        fee_per_month: feePerMonth ? Number(feePerMonth) : 3000,
        fee_per_hour: feePerHour ? Number(feePerHour) : null,
        availability_days: availabilityDays,
        availability_time: availabilityTime,
        description: description.trim(),
      };
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save profile role");
      }

      toast.success("Account setup complete!");

      // Redirect based on selected role
      if (role === "teacher") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:py-10 bg-[color:var(--bg)]">
      <div
        className={`bg-white rounded-3xl border border-[color:var(--border-earth)] p-6 sm:p-10 w-full shadow-sm transition-all duration-300 ${
          role === "teacher" ? "max-w-3xl" : "max-w-lg"
        }`}
      >
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

          {/* Render inputs ONLY if role has been selected */}
          {role !== null && (
            <div className="flex flex-col gap-6 pt-2 border-t border-[color:var(--border-earth)]">
              {/* Student Role Form */}
              {role === "student" && (
                <div>
                  <label className="text-xs font-semibold text-[color:var(--ink)] block mb-1.5">
                    Contact Phone Number <span className="text-[color:var(--terracotta)]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-[color:var(--border-earth)] rounded-xl p-3 outline-none focus:border-[color:var(--terracotta)] transition-colors"
                  />
                  <p className="text-[11px] text-[color:var(--ink-soft)] mt-1">
                    Required for verified tutors to contact you regarding tuition requests.
                  </p>
                </div>
              )}

              {/* Teacher Role Form - Exactly matching the /dashboard/teacher UI */}
              {role === "teacher" && (
                <div className="flex flex-col gap-5">
                  <div className="mb-2">
                    <h2 className="font-display font-bold text-lg text-[color:var(--ink)]">
                      Tutor Profile & Teaching Preferences
                    </h2>
                    <p className="text-xs text-[color:var(--ink-soft)] mt-0.5">
                      Accurate details ensure you get inquiries matching your preferred classes and localities in Dibrugarh
                    </p>
                  </div>

                  {/* Phone Number (Saved to User table) */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      Contact Phone Number <span className="text-[color:var(--terracotta)]">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        Display Name <span className="text-[color:var(--terracotta)]">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Pratyay Borah"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        Highest Qualification <span className="text-[color:var(--terracotta)]">*</span>
                      </label>
                      <select
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)] bg-white"
                      >
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        Teaching Experience (Years) <span className="text-[color:var(--terracotta)]">*</span>
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        Your Locality in Dibrugarh <span className="text-[color:var(--terracotta)]">*</span>
                      </label>
                      <select
                        value={locationArea}
                        onChange={(e) => setLocationArea(e.target.value)}
                        className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)] bg-white"
                      >
                        {areas.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subjects You Teach */}
                  <div>
                    <label className="text-xs font-semibold block mb-2">
                      Subjects You Teach <span className="text-[color:var(--terracotta)]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUBJECTS.map((s) => {
                        const selected = subjects.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSubject(s)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              selected
                                ? "bg-[color:var(--ink)] text-white border-[color:var(--ink)]"
                                : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Classes */}
                  <div>
                    <label className="text-xs font-semibold block mb-2">
                      Target Classes <span className="text-[color:var(--terracotta)]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CLASSES.map((c) => {
                        const selected = classes.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleClass(c)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              selected
                                ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]"
                                : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tuition Modes */}
                  <div>
                    <label className="text-xs font-semibold block mb-2">
                      Tuition Modes <span className="text-[color:var(--terracotta)]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MODES.map((m) => {
                        const selected = tuitionModes.includes(m.value);
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => toggleMode(m.value)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              selected
                                ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]"
                                : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Days */}
                  <div>
                    <label className="text-xs font-semibold block mb-2">
                      Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => {
                        const selected = availabilityDays.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDay(d)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              selected
                                ? "bg-[color:var(--ink)] text-white border-[color:var(--ink)]"
                                : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fees & Availability */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        Monthly Fee (₹) <span className="text-[color:var(--terracotta)]">*</span>
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={feePerMonth}
                        onChange={(e) => setFeePerMonth(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        Hourly Fee (₹ Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 300"
                        value={feePerHour}
                        onChange={(e) => setFeePerHour(e.target.value ? Number(e.target.value) : "")}
                        className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        Available Hours
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5:00 PM - 8:00 PM"
                        value={availabilityTime}
                        onChange={(e) => setAvailabilityTime(e.target.value)}
                        className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)]"
                      />
                    </div>
                  </div>

                  {/* About Teaching Approach */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      About Your Teaching Approach
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Highlight your previous results, special focus for board exams (SEBA / CBSE), teaching style..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none focus:border-[color:var(--terracotta)]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] text-white w-full py-5 font-semibold text-sm transition-all"
              >
                {submitting
                  ? "Saving Profile..."
                  : role === "teacher"
                  ? "Save Tutor Profile & Continue"
                  : "Complete Setup & Continue"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
