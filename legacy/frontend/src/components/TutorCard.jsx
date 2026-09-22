import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, GraduationCap, IndianRupee, Clock } from "lucide-react";

export default function TutorCard({ t, onSave, saved }) {
  const initials = (t.name || "T").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div data-testid={`tutor-card-${t.id}`} className="card-lift bg-white border border-[color:var(--border-earth)] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-[color:var(--surface)] border border-[color:var(--border-earth)] grid place-items-center font-display font-bold text-lg text-[color:var(--ink)]">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-semibold text-base truncate" data-testid={`tutor-name-${t.id}`}>{t.name}</h3>
            {t.is_verified && <BadgeCheck size={16} className="text-[color:var(--terracotta)]" data-testid={`tutor-verified-${t.id}`}/>}
          </div>
          <div className="text-xs text-[color:var(--ink-soft)] flex items-center gap-1 mt-0.5">
            <GraduationCap size={12}/> {t.qualification} · {t.experience_years} yrs exp
          </div>
          <div className="text-xs text-[color:var(--ink-soft)] flex items-center gap-1 mt-0.5">
            <MapPin size={12}/> {t.location_area}, Dibrugarh
          </div>
        </div>
        {onSave && (
          <button
            data-testid={`tutor-save-${t.id}`}
            onClick={() => onSave(t)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${saved ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]" : "border-[color:var(--border-earth)] hover:border-[color:var(--terracotta)]"}`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {t.subjects?.slice(0, 4).map((s) => <span key={s} className="tag-sage">{s}</span>)}
        {t.subjects?.length > 4 && <span className="tag-sage">+{t.subjects.length - 4}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {t.classes?.slice(0, 5).map((c) => <span key={c} className="tag-terra">{c}</span>)}
        {t.classes?.length > 5 && <span className="tag-terra">+{t.classes.length - 5}</span>}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border-earth)] mt-1">
        <div>
          <div className="flex items-center text-[color:var(--ink)] font-display font-semibold text-sm">
            <IndianRupee size={13}/>{t.fee_per_month}/mo
          </div>
          {t.availability_time && (
            <div className="text-[11px] text-[color:var(--ink-soft)] flex items-center gap-1"><Clock size={11}/>{t.availability_time}</div>
          )}
        </div>
        <Link
          to={`/tutors/${t.id}`}
          data-testid={`tutor-view-${t.id}`}
          className="text-xs px-3.5 py-1.5 rounded-full bg-[color:var(--ink)] text-white hover:bg-[color:var(--terracotta)] transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
