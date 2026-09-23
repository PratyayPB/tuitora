"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Flag, Trash2, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useUser();

  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [bookedTuitions, setBookedTuitions] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>("30");
  const [activeTab, setActiveTab] = useState<"teachers" | "users" | "reports" | "bookedTuitions">("teachers");
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, tRes, uRes, rRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/teachers"),
        fetch("/api/admin/users"),
        fetch("/api/admin/reports"),
      ]);

      if (sRes.ok) setStats(await sRes.json());
      if (tRes.ok) setTeachers(await tRes.json());
      if (uRes.ok) setUsersList(await uRes.json());
      if (rRes.ok) setReports(await rRes.json());
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookedTuitions = useCallback(async (filterVal: string) => {
    try {
      const query = filterVal ? `?filter=${filterVal}` : "";
      const res = await fetch(`/api/admin/booked-tuitions${query}`);
      if (res.ok) {
        const data = await res.json();
        setBookedTuitions(data);
      }
    } catch {
      toast.error("Failed to load booked tuitions");
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    fetchBookedTuitions(timeFilter);
  }, [timeFilter, fetchBookedTuitions]);

  const handleVerifyTeacher = async (teacherId: string, verified: boolean) => {
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });

      if (res.ok) {
        toast.success(verified ? "Teacher verified" : "Verification removed");
        fetchAdminData();
      }
    } catch {
      toast.error("Failed to update verification");
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this teacher profile?")) return;
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Teacher profile deleted");
        fetchAdminData();
      }
    } catch {
      toast.error("Failed to delete profile");
    }
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked }),
      });

      if (res.ok) {
        toast.success(blocked ? "User account blocked" : "User unblocked");
        fetchAdminData();
      }
    } catch {
      toast.error("Failed to update user block status");
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] py-10 px-5 lg:px-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="label-eyebrow">ADMINISTRATOR CONTROL</div>
        <h1 className="font-display font-black text-3xl text-[color:var(--ink)] mt-1">
          Platform Management
        </h1>
        <p className="text-xs text-[color:var(--ink-soft)] mt-1">
          Verify local tutors, manage user status, review student reports, and track booked tuitions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--border-earth)]">
          <div className="text-xs text-[color:var(--ink-soft)] uppercase font-semibold">
            Total Users
          </div>
          <div className="font-display font-black text-2xl text-[color:var(--ink)] mt-1">
            {stats?.total_users ?? 0}
          </div>
          <div className="text-[11px] text-[color:var(--ink-soft)] mt-0.5">
            {stats?.students ?? 0} Students · {stats?.teachers ?? 0} Teachers
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[color:var(--border-earth)]">
          <div className="text-xs text-[color:var(--ink-soft)] uppercase font-semibold">
            Verified Tutors
          </div>
          <div className="font-display font-black text-2xl text-green-700 mt-1">
            {stats?.verified_teachers ?? 0}
          </div>
          <div className="text-[11px] text-[color:var(--ink-soft)] mt-0.5">
            {stats?.unverified_teachers ?? 0} Pending Verification
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[color:var(--border-earth)]">
          <div className="text-xs text-[color:var(--ink-soft)] uppercase font-semibold">
            Tuition Inquiries
          </div>
          <div className="font-display font-black text-2xl text-[color:var(--terracotta)] mt-1">
            {stats?.total_requests ?? 0}
          </div>
          <div className="text-[11px] text-[color:var(--ink-soft)] mt-0.5">
            Direct Connections Made
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[color:var(--border-earth)]">
          <div className="text-xs text-[color:var(--ink-soft)] uppercase font-semibold">
            Reports Pending
          </div>
          <div className="font-display font-black text-2xl text-red-600 mt-1">
            {stats?.pending_reports ?? 0}
          </div>
          <div className="text-[11px] text-[color:var(--ink-soft)] mt-0.5">
            Review below
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[color:var(--border-earth)] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("teachers")}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === "teachers"
              ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Teacher Profiles ({teachers.length})
        </button>
        <button
          onClick={() => setActiveTab("bookedTuitions")}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === "bookedTuitions"
              ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Booked Tutions ({bookedTuitions.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === "users"
              ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          All Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === "reports"
              ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Reports ({reports.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "teachers" && (
        <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-[color:var(--surface)] border-b border-[color:var(--border-earth)] text-[color:var(--ink-soft)] uppercase font-semibold">
              <tr>
                <th className="p-4">Teacher Name</th>
                <th className="p-4">Locality</th>
                <th className="p-4">Subjects & Classes</th>
                <th className="p-4">Monthly Fee</th>
                <th className="p-4">Verified</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-earth)]">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50/50">
                  <td className="p-4 font-semibold text-[color:var(--ink)]">
                    <div>{t.name}</div>
                    <div className="text-[11px] text-[color:var(--ink-soft)] font-normal">
                      {t.qualification} · {t.experience_years} yrs exp
                    </div>
                  </td>
                  <td className="p-4">{t.location_area}, Dibrugarh</td>
                  <td className="p-4">
                    <div className="text-[11px] font-medium">
                      {t.subjects?.slice(0, 3).join(", ")}
                    </div>
                    <div className="text-[11px] text-[color:var(--ink-soft)]">
                      {t.classes?.slice(0, 3).join(", ")}
                    </div>
                  </td>
                  <td className="p-4 font-semibold">₹{t.fee_per_month}</td>
                  <td className="p-4">
                    {t.is_verified ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant={t.is_verified ? "outline" : "default"}
                        className="rounded-full text-xs"
                        onClick={() =>
                          handleVerifyTeacher(t.id, !t.is_verified)
                        }
                      >
                        {t.is_verified ? "Revoke" : "Verify"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleDeleteTeacher(t.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "bookedTuitions" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[color:var(--border-earth)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[color:var(--ink)]">
              <Filter size={14} className="text-[color:var(--terracotta)]" />
              <span>Filter by Response Date:</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: "Last 1 Day", value: "1" },
                { label: "Last 1 Week", value: "7" },
                { label: "Last 30 Days", value: "30" },
                { label: "All Time", value: "" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTimeFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    timeFilter === f.value
                      ? "bg-[color:var(--terracotta)] text-white shadow-sm"
                      : "bg-[color:var(--surface)] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] border border-[color:var(--border-earth)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-[color:var(--surface)] border-b border-[color:var(--border-earth)] text-[color:var(--ink-soft)] uppercase font-semibold">
                <tr>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Teacher Name</th>
                  <th className="p-4">Subject & Class</th>
                  <th className="p-4">Preferred Location</th>
                  <th className="p-4">Preferred Time</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Accepted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border-earth)]">
                {bookedTuitions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-[color:var(--ink-soft)]">
                      No booked tuitions found for the selected timeframe.
                    </td>
                  </tr>
                ) : (
                  bookedTuitions.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 font-semibold text-[color:var(--ink)]">
                        <div>{b.student_name}</div>
                        {b.student_phone && (
                          <div className="text-[11px] text-[color:var(--ink-soft)] font-normal">
                            {b.student_phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-[color:var(--ink)]">
                        {b.teacher_name}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[color:var(--ink)]">{b.subject}</div>
                        <div className="text-[11px] text-[color:var(--ink-soft)]">{b.class_std}</div>
                      </td>
                      <td className="p-4 text-[color:var(--ink-soft)]">
                        {b.preferred_area || b.preferred_location || "—"}
                      </td>
                      <td className="p-4 text-[color:var(--ink-soft)]">
                        {b.preferred_time || "—"}
                      </td>
                      <td className="p-4 font-semibold text-[color:var(--ink)]">
                        {b.budget ? `₹${b.budget}/mo` : "—"}
                      </td>
                      <td className="p-4 text-[color:var(--ink-soft)] whitespace-nowrap">
                        {b.responded_at
                          ? new Date(b.responded_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-[color:var(--surface)] border-b border-[color:var(--border-earth)] text-[color:var(--ink-soft)] uppercase font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-earth)]">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/50">
                  <td className="p-4 font-semibold text-[color:var(--ink)]">
                    {u.name}
                  </td>
                  <td className="p-4 text-[color:var(--ink-soft)]">{u.email}</td>
                  <td className="p-4 text-[color:var(--ink-soft)]">
                    {u.phone || "—"}
                  </td>
                  <td className="p-4 capitalize font-medium">{u.role}</td>
                  <td className="p-4">
                    {u.is_blocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== "admin" && (
                      <Button
                        size="sm"
                        variant={u.is_blocked ? "outline" : "ghost"}
                        className={
                          u.is_blocked
                            ? "text-green-700 rounded-full"
                            : "text-red-600 rounded-full"
                        }
                        onClick={() => handleBlockUser(u.id, !u.is_blocked)}
                      >
                        {u.is_blocked ? "Unblock" : "Block"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="flex flex-col gap-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] p-12 text-center text-xs text-[color:var(--ink-soft)]">
              No reports lodged by students or parents.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white p-5 rounded-2xl border border-[color:var(--border-earth)] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-red-600 flex items-center gap-1">
                    <Flag size={14} /> Report Incident
                  </span>
                  <span className="text-neutral-400 font-normal">
                    {new Date(rep.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-[color:var(--ink-soft)] bg-[color:var(--surface)] p-3 rounded-xl">
                  {rep.reason}
                </div>
                <div className="text-[11px] text-neutral-400">
                  Target User ID: {rep.target_user_id}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
