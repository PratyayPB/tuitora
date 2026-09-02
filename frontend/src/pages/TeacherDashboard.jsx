import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CLASSES, SUBJECTS, MODES, DAYS, QUALIFICATIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Phone, UserCheck, ShieldAlert, Sparkles, Inbox, User } from "lucide-react";
import { toast } from "sonner";

export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("inbox");
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState(QUALIFICATIONS[0]);
  const [subjects, setSubjects] = useState(["Mathematics"]);
  const [classes, setClasses] = useState(["Class 10"]);
  const [experienceYears, setExperienceYears] = useState(3);
  const [locationArea, setLocationArea] = useState("");
  const [tuitionModes, setTuitionModes] = useState(["home"]);
  const [feePerMonth, setFeePerMonth] = useState(3000);
  const [feePerHour, setFeePerHour] = useState("");
  const [availabilityDays, setAvailabilityDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [availabilityTime, setAvailabilityTime] = useState("5:00 PM - 8:00 PM");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "teacher")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === "teacher") {
      api.get("/meta/areas").then(res => {
        setAreas(res.data);
        if (res.data.length > 0 && !locationArea) setLocationArea(res.data[0]);
      }).catch(() => {});

      fetchProfile();
      fetchRequests();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/teachers/me");
      const p = res.data;
      setProfile(p);
      setName(p.name || user.name || "");
      setQualification(p.qualification || QUALIFICATIONS[0]);
      setSubjects(p.subjects || []);
      setClasses(p.classes || []);
      setExperienceYears(p.experience_years ?? 3);
      setLocationArea(p.location_area || "");
      setTuitionModes(p.tuition_modes || []);
      setFeePerMonth(p.fee_per_month ?? 3000);
      setFeePerHour(p.fee_per_hour ?? "");
      setAvailabilityDays(p.availability_days || []);
      setAvailabilityTime(p.availability_time || "");
      setDescription(p.description || "");
    } catch (err) {
      // Profile not created yet
      setName(user?.name || "");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests/received");
      setRequests(res.data);
    } catch (err) {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    if (classes.length === 0) {
      toast.error("Please select at least one class");
      return;
    }
    if (tuitionModes.length === 0) {
      toast.error("Please select at least one tuition mode");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        qualification,
        subjects,
        classes,
        experience_years: parseInt(experienceYears, 10),
        location_area: locationArea,
        tuition_modes: tuitionModes,
        fee_per_month: parseInt(feePerMonth, 10),
        fee_per_hour: feePerHour ? parseInt(feePerHour, 10) : undefined,
        availability_days: availabilityDays,
        availability_time: availabilityTime || undefined,
        description: description || undefined,
      };
      const res = await api.post("/teachers/profile", payload);
      setProfile(res.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const newStatus = !profile.is_available;
      await api.patch(`/teachers/availability?is_available=${newStatus}`);
      setProfile({ ...profile, is_available: newStatus });
      toast.success(`Tuition status set to: ${newStatus ? "Accepting Students" : "Full / Unavailable"}`);
    } catch (err) {
      toast.error("Failed to update availability");
    }
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      await api.patch(`/requests/${requestId}/status`, { status });
      toast.success(`Request marked as ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update request");
    }
  };

  const toggleSubject = (s) => {
    if (subjects.includes(s)) setSubjects(subjects.filter(item => item !== s));
    else setSubjects([...subjects, s]);
  };

  const toggleClass = (c) => {
    if (classes.includes(c)) setClasses(classes.filter(item => item !== c));
    else setClasses([...classes, c]);
  };

  const toggleMode = (m) => {
    if (tuitionModes.includes(m)) setTuitionModes(tuitionModes.filter(item => item !== m));
    else setTuitionModes([...tuitionModes, m]);
  };

  const toggleDay = (d) => {
    if (availabilityDays.includes(d)) setAvailabilityDays(availabilityDays.filter(item => item !== d));
    else setAvailabilityDays([...availabilityDays, d]);
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] py-10 px-5 lg:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="label-eyebrow">TEACHER PORTAL</div>
          <h1 className="font-display font-black text-3xl text-[color:var(--ink)] mt-1">
            Teacher Dashboard
          </h1>
          <p className="text-xs text-[color:var(--ink-soft)] mt-1">
            Manage inquiries, update teaching subjects, and toggle availability
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAvailability}
              className={`text-xs px-4 py-2 rounded-full font-semibold border transition-all ${
                profile.is_available
                  ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                  : "bg-neutral-200 text-neutral-700 border-neutral-300"
              }`}
            >
              Status: {profile.is_available ? "● Accepting Inquiries" : "○ Not Available"}
            </button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to={`/tutors/${profile.id}`}>View Public Profile</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Verification status card */}
      <div className="mb-8 p-4 rounded-2xl border flex items-center justify-between gap-4 bg-white border-[color:var(--border-earth)]">
        <div className="flex items-center gap-3">
          {profile?.is_verified ? (
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 grid place-items-center">
              <UserCheck size={20} />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 grid place-items-center">
              <ShieldAlert size={20} />
            </div>
          )}
          <div>
            <div className="font-semibold text-xs text-[color:var(--ink)]">
              Verification Status: {profile?.is_verified ? "Verified Teacher" : "Pending Administrator Review"}
            </div>
            <div className="text-[11px] text-[color:var(--ink-soft)]">
              {profile?.is_verified
                ? "Your profile displays the verified badge to parents in Dibrugarh."
                : "Complete your profile to receive the verified badge after administrator checks."}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[color:var(--border-earth)] mb-8">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "inbox" ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]" : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"}`}
        >
          <Inbox size={14} /> Student Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "profile" ? "border-[color:var(--terracotta)] text-[color:var(--terracotta)]" : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"}`}
        >
          <User size={14} /> Edit Tutor Profile
        </button>
      </div>

      {/* Tab: Inbox */}
      {activeTab === "inbox" && (
        <div className="flex flex-col gap-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] p-12 text-center">
              <div className="font-display font-bold text-lg mb-1">No Tuition Requests Yet</div>
              <p className="text-xs text-[color:var(--ink-soft)]">
                Make sure your profile is complete with subjects and locality to appear in search results.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((r) => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-[color:var(--border-earth)] shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-base text-[color:var(--ink)]">{r.student_name}</h3>
                        <div className="text-xs text-[color:var(--ink-soft)] mt-0.5">
                          Needs {r.subject} · {r.class_std}
                        </div>
                        <div className="text-xs text-[color:var(--ink-soft)] mt-0.5">
                          Area: {r.preferred_area} {r.preferred_time ? `• Time: ${r.preferred_time}` : ""}
                        </div>
                        {r.budget && <div className="text-xs font-semibold text-[color:var(--ink)] mt-1">Proposed Budget: ₹{r.budget}/mo</div>}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                        r.status === "accepted" ? "bg-green-100 text-green-800" :
                        r.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>

                    {r.message && (
                      <div className="text-xs bg-[color:var(--surface)] p-3 rounded-xl mt-3 text-[color:var(--ink-soft)]">
                        "{r.message}"
                      </div>
                    )}
                  </div>

                  {r.status === "pending" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[color:var(--border-earth)]">
                      <Button
                        size="sm"
                        onClick={() => handleRequestStatus(r.id, "accepted")}
                        className="rounded-full bg-green-700 hover:bg-green-800 text-white text-xs flex-1 flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={13}/> Accept Request
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestStatus(r.id, "rejected")}
                        className="rounded-full text-red-600 hover:bg-red-50 text-xs flex-1 flex items-center justify-center gap-1"
                      >
                        <XCircle size={13}/> Decline
                      </Button>
                    </div>
                  )}

                  {r.status === "accepted" && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center justify-between text-xs text-green-900">
                      <div>
                        <span className="font-semibold block">Student Contact Revealed:</span>
                        <span className="flex items-center gap-1 mt-0.5"><Phone size={12}/> {r.student_phone}</span>
                      </div>
                      <a href={`tel:${r.student_phone}`} className="px-3 py-1.5 bg-green-700 text-white rounded-full font-semibold hover:bg-green-800">
                        Call Student
                      </a>
                    </div>
                  )}

                  <div className="text-[11px] text-neutral-400 text-right">
                    Received: {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[color:var(--border-earth)] shadow-sm max-w-3xl">
          <div className="mb-6 pb-4 border-b border-[color:var(--border-earth)]">
            <h2 className="font-display font-bold text-xl text-[color:var(--ink)]">
              Tutor Profile & Teaching Preferences
            </h2>
            <p className="text-xs text-[color:var(--ink-soft)] mt-0.5">
              Accurate details ensure you get inquiries matching your preferred classes and localities in Dibrugarh
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Display Name *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Highest Qualification *</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                >
                  {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Teaching Experience (Years) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Your Locality in Dibrugarh *</label>
                <select
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                >
                  {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="text-xs font-semibold block mb-2">Subjects You Teach *</label>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.map((s) => {
                  const selected = subjects.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected ? "bg-[color:var(--ink)] text-white border-[color:var(--ink)]" : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Classes */}
            <div>
              <label className="text-xs font-semibold block mb-2">Target Classes *</label>
              <div className="flex flex-wrap gap-1.5">
                {CLASSES.map((c) => {
                  const selected = classes.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleClass(c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]" : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modes */}
            <div>
              <label className="text-xs font-semibold block mb-2">Tuition Modes *</label>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => {
                  const selected = tuitionModes.includes(m.value);
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => toggleMode(m.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]" : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Days */}
            <div>
              <label className="text-xs font-semibold block mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const selected = availabilityDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected ? "bg-[color:var(--ink)] text-white border-[color:var(--ink)]" : "border-[color:var(--border-earth)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Monthly Fee (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={feePerMonth}
                  onChange={(e) => setFeePerMonth(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Hourly Fee (₹ Optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 300"
                  value={feePerHour}
                  onChange={(e) => setFeePerHour(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Available Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 5pm - 8pm"
                  value={availabilityTime}
                  onChange={(e) => setAvailabilityTime(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">About Your Teaching Approach</label>
              <textarea
                rows={4}
                placeholder="Highlight your previous results, special focus for board exams (SEBA / CBSE), teaching style..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] text-white self-start px-8 py-5"
            >
              {saving ? "Saving Profile..." : "Save Tutor Profile"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
