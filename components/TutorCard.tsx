import React from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, GraduationCap, IndianRupee, Clock } from "lucide-react";

export interface TeacherProfile {
  id: string;
  name: string;
  qualification: string;
  subjects: string[];
  classes: string[];
  experience_years: number;
  location_area: string;
  tuition_modes: string[];
  fee_per_month: number;
  fee_per_hour?: number | null;
  availability_days?: string[];
  availability_time?: string;
  description?: string;
  is_verified: boolean;
  is_available?: boolean;
  user_id?: string;
  phone?: string;
  email?: string;
}

interface TutorCardProps {
  t: TeacherProfile;
  onSave?: (t: TeacherProfile) => void;
  saved?: boolean;
}

export default function TutorCard({ t, onSave, saved }: TutorCardProps) {
  const initials = (t.name || "T")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      data-testid={`tutor-card-${t.id}`}
      className="card-lift bg-white border border-[color:var(--border-earth)] rounded-2xl p-5 flex flex-col justify-between gap-3"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-[color:var(--surface)] border border-[color:var(--border-earth)] grid place-items-center font-display font-bold text-lg text-[color:var(--ink)] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3
              className="font-display font-semibold text-base truncate"
              data-testid={`tutor-name-${t.id}`}
            >
              {t.name}
            </h3>
            {t.is_verified && (
              <BadgeCheck
                size={16}
                className="text-[color:var(--terracotta)] shrink-0"
                data-testid={`tutor-verified-${t.id}`}
              />
            )}
          </div>
          <div className="text-xs text-[color:var(--ink-soft)] flex items-center gap-1 mt-0.5">
            <GraduationCap size={12} /> {t.qualification} · {t.experience_years} yrs exp
          </div>
          <div className="text-xs text-[color:var(--ink-soft)] flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> {t.location_area}, Dibrugarh
          </div>
        </div>
        {onSave && (
          <button
            data-testid={`tutor-save-${t.id}`}
            onClick={() => onSave(t)}
            className={`text-xs px-3 py-1.5 min-h-[44px] min-w-[44px] md:min-h-[32px] md:min-w-0 flex items-center justify-center rounded-full border transition-all ${
              saved
                ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]"
                : "border-[color:var(--border-earth)] hover:border-[color:var(--terracotta)]"
            }`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {t.subjects?.slice(0, 4).map((s) => (
          <span key={s} className="tag-sage">
            {s}
          </span>
        ))}
        {t.subjects?.length > 4 && (
          <span className="tag-sage">+{t.subjects.length - 4}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {t.classes?.slice(0, 5).map((c) => (
          <span key={c} className="tag-terra">
            {c}
          </span>
        ))}
        {t.classes?.length > 5 && (
          <span className="tag-terra">+{t.classes.length - 5}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border-earth)] mt-1">
        <div>
          <div className="flex items-center text-[color:var(--ink)] font-display font-semibold text-sm">
            <IndianRupee size={13} />
            {t.fee_per_month}/mo
          </div>
          {t.availability_time && (
            <div className="text-[11px] text-[color:var(--ink-soft)] flex items-center gap-1">
              <Clock size={11} />
              {t.availability_time}
            </div>
          )}
        </div>
        <Link
          href={`/teachers/${t.id}`}
          data-testid={`tutor-view-${t.id}`}
          className="text-xs px-4 py-2 min-h-[44px] md:min-h-[32px] flex items-center justify-center rounded-full bg-[color:var(--ink)] text-white hover:bg-[color:var(--terracotta)] transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
