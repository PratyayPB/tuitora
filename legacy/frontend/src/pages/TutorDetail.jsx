import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BadgeCheck, MapPin, GraduationCap, IndianRupee, Clock, Calendar, Phone, Mail, Send, Flag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TutorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tuition Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSubject, setRequestSubject] = useState("");
  const [requestClass, setRequestClass] = useState("");
  const [requestArea, setRequestArea] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [requestBudget, setRequestBudget] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    fetchTutor();
  }, [id]);

  const fetchTutor = async () => {
    try {
      const res = await api.get(`/teachers/${id}`);
      setTutor(res.data);
      if (res.data.subjects?.length > 0) setRequestSubject(res.data.subjects[0]);
      if (res.data.classes?.length > 0) setRequestClass(res.data.classes[0]);
      setRequestArea(res.data.location_area || "");
    } catch (err) {
      toast.error("Failed to load tutor details");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to contact this tutor");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      toast.error("Only registered students/parents can send tuition inquiries");
      return;
    }

    setSendingRequest(true);
    try {
      await api.post("/requests", {
        teacher_id: tutor.id,
        subject: requestSubject,
        class_std: requestClass,
        preferred_area: requestArea,
        preferred_time: requestTime || undefined,
        budget: requestBudget ? parseInt(requestBudget, 10) : undefined,
        message: requestMessage || undefined,
      });
      toast.success("Tuition request sent successfully! The teacher will review it.");
      setShowRequestModal(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to report");
      return;
    }
    if (!reportReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    setSendingReport(true);
    try {
      await api.post("/reports", {
        target_user_id: tutor.user_id,
        reason: reportReason,
      });
      toast.success("Report submitted to administrator for review.");
      setShowReportModal(false);
      setReportReason("");
    } catch (err) {
      toast.error("Failed to submit report");
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen py-20 text-center text-sm text-[color:var(--ink-soft)]">Loading tutor profile...</div>;
  }

  if (!tutor) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h2 className="text-xl font-bold mb-4">Tutor Not Found</h2>
        <Button asChild><Link to="/tutors">Browse All Tutors</Link></Button>
      </div>
    );
  }

  const initials = (tutor.name || "T").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[color:var(--bg)] py-10 px-5 lg:px-10 max-w-5xl mx-auto">
      <Link to="/tutors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--ink-soft)] hover:text-[color:var(--terracotta)] mb-6">
        <ArrowLeft size={14} /> Back to Tutors
      </Link>

      <div className="bg-white rounded-3xl border border-[color:var(--border-earth)] p-6 sm:p-10 shadow-sm flex flex-col gap-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[color:var(--border-earth)]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[color:var(--surface)] border border-[color:var(--border-earth)] grid place-items-center font-display font-black text-2xl text-[color:var(--ink)]">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-[color:var(--ink)]" data-testid="tutor-detail-name">
                  {tutor.name}
                </h1>
                {tutor.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta)] px-2.5 py-0.5 rounded-full font-semibold">
                    <BadgeCheck size={14} /> Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-[color:var(--ink-soft)] flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><GraduationCap size={15}/> {tutor.qualification}</span>
                <span>•</span>
                <span>{tutor.experience_years} Years Experience</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={15}/> {tutor.location_area}, Dibrugarh</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              data-testid="request-tuition-btn"
              onClick={() => setShowRequestModal(true)}
              className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] px-6 text-white w-full sm:w-auto flex items-center gap-2"
            >
              <Send size={16} /> Request Tuition
            </Button>
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2.5 rounded-full border border-[color:var(--border-earth)] hover:bg-neutral-100 text-[color:var(--ink-soft)]"
              title="Report Profile"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>

        {/* Pricing & Contact Revealed section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[color:var(--surface)] p-6 rounded-2xl border border-[color:var(--border-earth)]">
          <div>
            <div className="text-xs text-[color:var(--ink-soft)] uppercase font-semibold">Monthly Tuition Fee</div>
            <div className="font-display font-bold text-xl text-[color:var(--ink)] flex items-center mt-0.5">
              <IndianRupee size={18} /> {tutor.fee_per_month} / mo
            </div>
          </div>
          <div>
            <div className="text-xs text-[color:var(--ink-soft)] uppercase font-semibold">Hourly Rate (Optional)</div>
            <div className="font-display font-bold text-xl text-[color:var(--ink)] flex items-center mt-0.5">
              {tutor.fee_per_hour ? (
                <><IndianRupee size={18} /> {tutor.fee_per_hour} / hr</>
              ) : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-[color:var(--ink-soft)] uppercase font-semibold">Contact Status</div>
            <div className="text-xs text-[color:var(--ink-soft)] mt-1">
              {tutor.phone ? (
                <div className="flex flex-col gap-1 font-semibold text-[color:var(--ink)]">
                  <span className="flex items-center gap-1"><Phone size={13}/> {tutor.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={13}/> {tutor.email}</span>
                </div>
              ) : (
                <span className="text-neutral-500 italic">Revealed after request is accepted</span>
              )}
            </div>
          </div>
        </div>

        {/* About Bio */}
        {tutor.description && (
          <div>
            <h2 className="font-display font-bold text-lg mb-2 text-[color:var(--ink)]">About the Tutor</h2>
            <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed bg-[color:var(--bg)] p-5 rounded-2xl border border-[color:var(--border-earth)]">
              {tutor.description}
            </p>
          </div>
        )}

        {/* Subjects & Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display font-bold text-base mb-3 text-[color:var(--ink)]">Subjects Taught</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects?.map((s) => (
                <span key={s} className="tag-sage !text-xs !py-1 !px-3">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-base mb-3 text-[color:var(--ink)]">Classes / Standards</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.classes?.map((c) => (
                <span key={c} className="tag-terra !text-xs !py-1 !px-3">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability & Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[color:var(--border-earth)]">
          <div>
            <h2 className="font-display font-bold text-base mb-2 text-[color:var(--ink)] flex items-center gap-2">
              <Clock size={16}/> Availability & Timings
            </h2>
            <div className="text-sm text-[color:var(--ink-soft)] flex flex-col gap-1.5 mt-2">
              <div><strong>Days:</strong> {tutor.availability_days?.length ? tutor.availability_days.join(", ") : "Flexible"}</div>
              <div><strong>Time:</strong> {tutor.availability_time || "Flexible timings"}</div>
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-base mb-2 text-[color:var(--ink)]">Tuition Modes Offered</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {tutor.tuition_modes?.map((m) => (
                <span key={m} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 border border-[color:var(--border-earth)] capitalize">
                  {m.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Request Tuition Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[color:var(--border-earth)] shadow-2xl">
            <h3 className="font-display font-bold text-xl text-[color:var(--ink)]">Request Tuition with {tutor.name}</h3>
            <p className="text-xs text-[color:var(--ink-soft)] mt-1 mb-5">
              Specify your subject and timing requirements. Once the tutor accepts, their direct contact details will be shared.
            </p>

            <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Subject *</label>
                <select
                  required
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                >
                  {tutor.subjects?.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Class / Standard *</label>
                <select
                  required
                  value={requestClass}
                  onChange={(e) => setRequestClass(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                >
                  {tutor.classes?.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Your Locality in Dibrugarh *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Chowkidingee"
                    value={requestArea}
                    onChange={(e) => setRequestArea(e.target.value)}
                    className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Preferred Time</label>
                  <input
                    type="text"
                    placeholder="e.g. Evening 5-7pm"
                    value={requestTime}
                    onChange={(e) => setRequestTime(e.target.value)}
                    className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Budget / Fee per month (₹)</label>
                <input
                  type="number"
                  placeholder={`Default: ₹${tutor.fee_per_month}`}
                  value={requestBudget}
                  onChange={(e) => setRequestBudget(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Message for Teacher</label>
                <textarea
                  rows={3}
                  placeholder="Tell the teacher about your academic goals or board (CBSE / SEBA)..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendingRequest}
                  className="rounded-full bg-[color:var(--terracotta)] text-white hover:bg-[color:var(--terracotta-soft)]"
                >
                  {sendingRequest ? "Sending..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[color:var(--border-earth)] shadow-2xl">
            <h3 className="font-display font-bold text-lg text-red-600">Report Profile</h3>
            <p className="text-xs text-[color:var(--ink-soft)] mt-1 mb-4">
              Please explain why you are reporting {tutor.name}'s profile to platform administrators.
            </p>
            <form onSubmit={handleSendReport} className="flex flex-col gap-4">
              <textarea
                required
                rows={4}
                placeholder="Reason for report (e.g. incorrect contact, spam, improper behavior)..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs border border-[color:var(--border-earth)] rounded-xl p-3 outline-none"
              />
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowReportModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={sendingReport}>
                  {sendingReport ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
