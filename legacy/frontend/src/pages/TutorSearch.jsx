import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import TutorCard from "@/components/TutorCard";
import { CLASSES, SUBJECTS, MODES } from "@/lib/constants";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TutorSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [tutors, setTutors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "");
  const [classStd, setClassStd] = useState(searchParams.get("class_std") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [mode, setMode] = useState(searchParams.get("mode") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxFee, setMaxFee] = useState("");

  useEffect(() => {
    api.get("/meta/areas").then(res => setAreas(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === "student") {
      api.get("/saved").then(res => {
        setSavedIds(new Set(res.data.map(t => t.id)));
      }).catch(() => {});
    }
  }, [user]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (subject) params.append("subject", subject);
      if (classStd) params.append("class_std", classStd);
      if (area) params.append("area", area);
      if (mode) params.append("mode", mode);
      if (verifiedOnly) params.append("verified_only", "true");
      if (maxFee) params.append("max_fee", maxFee);

      const res = await api.get(`/teachers?${params.toString()}`);
      setTutors(res.data);
    } catch (err) {
      toast.error("Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [query, subject, classStd, area, mode, verifiedOnly, maxFee]);

  const handleToggleSave = async (tutor) => {
    if (!user) {
      toast.info("Please login as a student to save tutors");
      return;
    }
    if (user.role !== "student") return;

    const isSaved = savedIds.has(tutor.id);
    try {
      if (isSaved) {
        await api.delete(`/saved/${tutor.id}`);
        savedIds.delete(tutor.id);
        setSavedIds(new Set(savedIds));
        toast.success("Tutor removed from saved list");
      } else {
        await api.post(`/saved/${tutor.id}`);
        savedIds.add(tutor.id);
        setSavedIds(new Set(savedIds));
        toast.success("Tutor saved to your list");
      }
    } catch (err) {
      toast.error("Failed to update saved tutors");
    }
  };

  const handleReset = () => {
    setQuery("");
    setSubject("");
    setClassStd("");
    setArea("");
    setMode("");
    setVerifiedOnly(false);
    setMaxFee("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] py-10 px-5 lg:px-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="label-eyebrow">DIBRUGARH TUTOR DIRECTORY</div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[color:var(--ink)] mt-1">
          Find Your Ideal Private Tutor
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Showing {tutors.length} available teachers in Dibrugarh
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-[color:var(--border-earth)] h-fit flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-base flex items-center gap-1.5">
              <Filter size={16} /> Filters
            </div>
            <button onClick={handleReset} className="text-xs text-[color:var(--terracotta)] hover:underline flex items-center gap-1">
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Search keyword */}
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1.5">
              Search
            </label>
            <div className="flex items-center gap-2 border border-[color:var(--border-earth)] rounded-lg px-3 py-2">
              <Search size={14} className="text-[color:var(--ink-soft)]" />
              <input
                data-testid="filter-query"
                type="text"
                placeholder="Name, keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1.5">
              Locality / Area
            </label>
            <select
              data-testid="filter-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full text-xs border border-[color:var(--border-earth)] rounded-lg px-3 py-2 bg-transparent outline-none"
            >
              <option value="">All Areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1.5">
              Subject
            </label>
            <select
              data-testid="filter-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs border border-[color:var(--border-earth)] rounded-lg px-3 py-2 bg-transparent outline-none"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1.5">
              Class / Standard
            </label>
            <select
              data-testid="filter-class"
              value={classStd}
              onChange={(e) => setClassStd(e.target.value)}
              className="w-full text-xs border border-[color:var(--border-earth)] rounded-lg px-3 py-2 bg-transparent outline-none"
            >
              <option value="">All Classes</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1.5">
              Tuition Mode
            </label>
            <select
              data-testid="filter-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full text-xs border border-[color:var(--border-earth)] rounded-lg px-3 py-2 bg-transparent outline-none"
            >
              <option value="">Any Mode</option>
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Max Monthly Fee */}
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1.5">
              Max Monthly Budget (₹)
            </label>
            <input
              data-testid="filter-max-fee"
              type="number"
              placeholder="e.g. 4000"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="w-full text-xs border border-[color:var(--border-earth)] rounded-lg px-3 py-2 bg-transparent outline-none"
            />
          </div>

          {/* Verified Only */}
          <div className="flex items-center gap-2 pt-2 border-t border-[color:var(--border-earth)]">
            <input
              type="checkbox"
              id="verified-only"
              data-testid="filter-verified"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded accent-[color:var(--terracotta)]"
            />
            <label htmlFor="verified-only" className="text-xs font-medium cursor-pointer">
              Verified Tutors Only
            </label>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-20 text-sm text-[color:var(--ink-soft)]">
              Loading tutors...
            </div>
          ) : tutors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[color:var(--border-earth)] p-12 text-center">
              <div className="font-display font-bold text-lg mb-2">No tutors match your criteria</div>
              <p className="text-xs text-[color:var(--ink-soft)] max-w-sm mx-auto mb-4">
                Try loosening your filters or resetting the search to see all registered tutors across Dibrugarh.
              </p>
              <Button onClick={handleReset} variant="outline" className="rounded-full">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  t={tutor}
                  onSave={user?.role === "student" ? handleToggleSave : undefined}
                  saved={savedIds.has(tutor.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
