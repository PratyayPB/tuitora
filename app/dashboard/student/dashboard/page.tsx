"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import TutorCard, { TeacherProfile } from "@/components/TutorCard";
import { CLASSES, SUBJECTS, MODES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Heart,
  FileText,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user, isLoaded } = useUser();

  const [activeTab, setActiveTab] = useState<"requests" | "requirement" | "saved">("requests");
  const [requests, setRequests] = useState<any[]>([]);
  const [savedTutors, setSavedTutors] = useState<TeacherProfile[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [requirement, setRequirement] = useState<any>(null);
  const [savingReq, setSavingReq] = useState(false);

  // Requirement form
  const [reqStudentName, setReqStudentName] = useState("");
  const [reqClass, setReqClass] = useState("Class 10");
  const [reqSchool, setReqSchool] = useState("");
  const [reqSubjects, setReqSubjects] = useState<string[]>(["Mathematics"]);
  const [reqModes, setReqModes] = useState<string[]>(["home"]);
  const [reqArea, setReqArea] = useState("");
  const [reqTime, setReqTime] = useState("");
  const [reqBudgetMin, setReqBudgetMin] = useState(2000);
  const [reqBudgetMax, setReqBudgetMax] = useState(4000);
  const [reqDesc, setReqDesc] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests/sent");
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch {}
  }, []);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/saved");
      const data = await res.json();
      if (Array.isArray(data)) setSavedTutors(data);
    } catch {}
  }, []);

  const fetchRequirement = useCallback(async () => {
    try {
      const res = await fetch("/api/students/requirement");
      const data = await res.json();
      if (data && !data.error) {
        setRequirement(data);
        setReqStudentName(data.student_name || "");
        setReqClass(data.class_std || "Class 10");
        setReqSchool(data.school_name || "");
        setReqSubjects(data.subjects || []);
        setReqModes(data.preferred_modes || []);
        setReqArea(data.preferred_area || "");
        setReqTime(data.preferred_time || "");
        setReqBudgetMin(data.budget_min || 2000);
        setReqBudgetMax(data.budget_max || 4000);
        setReqDesc(data.description || "");
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/meta/areas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAreas(data);
          if (data.length > 0) setReqArea(data[0]);
        }
      })
      .catch(() => {});

    fetchRequests();
    fetchSaved();
    fetchRequirement();
  }, [fetchRequests, fetchSaved, fetchRequirement]);

  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReq(true);
    try {
      const payload = {
        student_name: reqStudentName || user?.fullName || "Student",
        class_std: reqClass,
        school_name: reqSchool || undefined,
        subjects: reqSubjects,
        preferred_modes: reqModes,
        preferred_area: reqArea,
        preferred_time: reqTime || undefined,
        budget_min: Number(reqBudgetMin),
        budget_max: Number(reqBudgetMax),
        description: reqDesc || undefined,
      };

      const res = await fetch("/api/students/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRequirement(data);
      toast.success("Learning requirement saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save requirement");
    } finally {
      setSavingReq(false);
    }
  };

  const handleDeleteRequirement = async () => {
    if (!window.confirm("Are you sure you want to remove your active requirement?")) return;
    try {
      const res = await fetch("/api/students/requirement", { method: "DELETE" });
      if (res.ok) {
        setRequirement(null);
        toast.success("Requirement removed");
      }
    } catch {
      toast.error("Failed to delete requirement");
    }
  };

  const handleUnsaveTutor = async (tutor: TeacherProfile) => {
    try {
      const res = await fetch(`/api/saved/${tutor.id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedTutors((prev) => prev.filter((t) => t.id !== tutor.id));
        toast.success("Tutor removed from saved list");
      }
    } catch {
      toast.error("Failed to update saved tutors");
    }
  };

  const toggleSubject = (s: string) => {
    setReqSubjects((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleMode = (m: string) => {
    setReqModes((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] py-10 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="label-eyebrow">STUDENT & PARENT PORTAL</div>
          <h1 className="font-display font-black text-3xl text-[color:var(--ink)] mt-1">
            Welcome, {user?.firstName || user?.fullName || "Student"}
          </h1>
          <p className="text-xs text-[color:var(--ink-soft)] mt-1">
            Track inquiries, update tuition requirements, and manage saved tutors.
          </p>
        </div>

        <Button
          asChild
          className="rounded-full bg-[color:var(--terracotta)] text-white hover:bg-[color:var(--terracotta-soft)] min-h-[44px]"
        >
          <Link href="/teachers">Find More Tutors</Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[color:var(--border-earth)] mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 px-4 min-h-[44px] text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "requests"
              ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          <Send size={14} /> Sent Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("requirement")}
          className={`pb-3 px-4 min-h-[44px] text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "requirement"
              ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          <FileText size={14} /> My Requirement {requirement ? "✓" : ""}
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`pb-3 px-4 min-h-[44px] text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "saved"
              ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          <Heart size={14} /> Saved Tutors ({savedTutors.length})
        </button>
      </div>

      {/* Tab: Requests */}
      {activeTab === "requests" && (
        <div className="flex flex-col gap-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] p-12 text-center">
              <div className="font-display font-bold text-lg mb-1">
                No Tuition Inquiries Sent Yet
              </div>
              <p className="text-xs text-[color:var(--ink-soft)] mb-4">
                Explore our directory of verified Dibrugarh educators and request
                private tuition.
              </p>
              <Button
                asChild
                className="rounded-full bg-[color:var(--terracotta)] text-white min-h-[44px]"
              >
                <Link href="/teachers">Browse Tutors</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-5 rounded-2xl border border-[color:var(--border-earth)] shadow-sm flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-base text-[color:var(--ink)]">
                          {r.teacher_name}
                        </h3>
                        <div className="text-xs text-[color:var(--ink-soft)] mt-0.5">
                          {r.subject} · {r.class_std} ({r.preferred_area})
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                          r.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : r.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status === "accepted" && <CheckCircle2 size={12} />}
                        {r.status === "rejected" && <XCircle size={12} />}
                        {r.status === "pending" && <Clock size={12} />}
                        {r.status.toUpperCase()}
                      </span>
                    </div>

                    {r.message && (
                      <div className="text-xs bg-[color:var(--surface)] p-3 rounded-xl mt-3 text-[color:var(--ink-soft)]">
                        &quot;{r.message}&quot;
                      </div>
                    )}
                  </div>

                  {r.status === "accepted" && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center justify-between text-xs text-green-900">
                      <div>
                        <span className="font-semibold block">
                          Accepted! Teacher Contact:
                        </span>
                        <span className="flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {r.teacher_phone || "Contact via App"}
                        </span>
                      </div>
                      {r.teacher_phone && (
                        <a
                          href={`tel:${r.teacher_phone}`}
                          className="px-3 py-1.5 bg-green-700 text-white rounded-full font-semibold hover:bg-green-800 min-h-[44px] flex items-center justify-center"
                        >
                          Call Teacher
                        </a>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-neutral-400 text-right">
                    Sent: {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Requirement */}
      {activeTab === "requirement" && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[color:var(--border-earth)] shadow-sm max-w-3xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[color:var(--border-earth)]">
            <div>
              <h2 className="font-display font-bold text-xl text-[color:var(--ink)]">
                Student Learning Profile & Needs
              </h2>
              <p className="text-xs text-[color:var(--ink-soft)] mt-0.5">
                Keep your standard requirements saved for rapid tuition inquiries
              </p>
            </div>
            {requirement && (
              <button
                onClick={handleDeleteRequirement}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 min-h-[44px]"
              >
                <Trash2 size={13} /> Clear Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSaveRequirement} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Student Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={reqStudentName}
                  onChange={(e) => setReqStudentName(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 min-h-[44px] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">
                  School / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salt Brook Academy / Don Bosco"
                  value={reqSchool}
                  onChange={(e) => setReqSchool(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 min-h-[44px] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Class / Standard *
                </label>
                <select
                  value={reqClass}
                  onChange={(e) => setReqClass(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 min-h-[44px] outline-none bg-transparent"
                >
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">
                  Preferred Locality in Dibrugarh *
                </label>
                <select
                  value={reqArea}
                  onChange={(e) => setReqArea(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 min-h-[44px] outline-none bg-transparent"
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2">
                Subjects Required *
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => {
                  const selected = reqSubjects.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={`text-xs px-4 py-2 min-h-[44px] flex items-center justify-center rounded-full border transition-all ${
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

            <div>
              <label className="text-xs font-semibold block mb-2">
                Preferred Tuition Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => {
                  const selected = reqModes.includes(m.value);
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => toggleMode(m.value)}
                      className={`text-xs px-4 py-2 min-h-[44px] flex items-center justify-center rounded-full border transition-all ${
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Budget Min (₹/mo)
                </label>
                <input
                  type="number"
                  value={reqBudgetMin}
                  onChange={(e) => setReqBudgetMin(Number(e.target.value))}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 min-h-[44px] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Budget Max (₹/mo)
                </label>
                <input
                  type="number"
                  value={reqBudgetMax}
                  onChange={(e) => setReqBudgetMax(Number(e.target.value))}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 min-h-[44px] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Preferred Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5pm - 8pm"
                  value={reqTime}
                  onChange={(e) => setReqTime(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 min-h-[44px] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">
                Special Notes / Needs
              </label>
              <textarea
                rows={3}
                placeholder="Mention specific board exam syllabus, weak areas, or preference..."
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
                className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={savingReq}
              className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] text-white self-start px-8 py-5 min-h-[44px]"
            >
              {savingReq ? "Saving..." : "Save Learning Profile"}
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Saved Tutors */}
      {activeTab === "saved" && (
        <div>
          {savedTutors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] p-12 text-center">
              <div className="font-display font-bold text-lg mb-1">
                No Saved Tutors Yet
              </div>
              <p className="text-xs text-[color:var(--ink-soft)] mb-4">
                Bookmark top tutors to compare rates and qualifications later.
              </p>
              <Button
                asChild
                className="rounded-full bg-[color:var(--terracotta)] text-white min-h-[44px]"
              >
                <Link href="/teachers">Browse Tutors</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  t={tutor}
                  onSave={handleUnsaveTutor}
                  saved={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
