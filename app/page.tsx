import React from "react";
import Link from "next/link";

import { MapPin, ShieldCheck, Users, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)]">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--surface)] border border-[color:var(--border-earth)] w-fit text-xs font-medium text-[color:var(--ink-soft)]">
              Dedicated to Dibrugarh students & parents
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-[color:var(--ink)]">
              Find verified home tutors in{" "}
              <span className="text-[color:var(--terracotta)]">Dibrugarh</span>
            </h1>
            <p className="text-base sm:text-lg text-[color:var(--ink-soft)] leading-relaxed max-w-2xl">
              Connect directly with qualified private tutors across
              Chowkidingee, Amolapatty, Naliapool, Milan Nagar, and all local
              areas for CBSE, SEBA, & College boards.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-[color:var(--border-earth)] mt-4">
              <div>
                <div className="font-display font-bold text-2xl text-[color:var(--ink)]">
                  {"6+"}
                </div>
                <div className="text-xs text-[color:var(--ink-soft)]">
                  Verified Tutors
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-[color:var(--ink)]">
                  {"25+"}
                </div>
                <div className="text-xs text-[color:var(--ink-soft)]">
                  Local Localities
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="font-display font-bold text-2xl text-[color:var(--ink)]">
                  100%
                </div>
                <div className="text-xs text-[color:var(--ink-soft)]">
                  Direct Connection
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden border border-[color:var(--border-earth)] shadow-xl bg-[color:var(--surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBzdHVkZW50JTIwc3R1ZHlpbmd8ZW58MHx8fHwxNzg3OTc1Mzk4fDA&ixlib=rb-4.1.0&q=85"
                alt="Student studying in Dibrugarh"
                className="w-full h-72 sm:h-96 object-cover"
              />
              <div className="p-5 sm:p-6 bg-white/90 backdrop-blur-md">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
                  <ShieldCheck
                    className="text-[color:var(--terracotta)] min-w-[18px]"
                    size={18}
                  />
                  Safe & Transparent Tutor Matching
                </div>
                <p className="text-xs text-[color:var(--ink-soft)] mt-1">
                  Contact details are securely revealed upon teacher
                  confirmation to protect privacy and eliminate spam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Tuitora */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="label-eyebrow">WHY CHOOSE TUITORA</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl mt-1 text-[color:var(--ink)]">
            Built specifically for Dibrugarh
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[color:var(--border-earth)] flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[color:var(--surface)] grid place-items-center text-[color:var(--terracotta)] shrink-0">
              <MapPin size={24} />
            </div>
            <h3 className="font-display font-bold text-lg">
              Hyper-Local Matching
            </h3>
            <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">
              Target tutors within walking or short commuting distance across
              all Dibrugarh pin codes and localities.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[color:var(--border-earth)] flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[color:var(--surface)] grid place-items-center text-[color:var(--terracotta)] shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-display font-bold text-lg">
              Admin Verified Credentials
            </h3>
            <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">
              Teachers qualifications and experience are screened to ensure
              quality academic mentorship.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[color:var(--border-earth)] flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-[color:var(--surface)] grid place-items-center text-[color:var(--terracotta)] shrink-0">
              <Users size={24} />
            </div>
            <h3 className="font-display font-bold text-lg">
              Zero Middleman Commission
            </h3>
            <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">
              Parents connect directly with educators. No hidden platform cuts
              or exorbitant broker charges.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--border-earth)] bg-white py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-[color:var(--ink-soft)]">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            © {new Date().getFullYear()} Tuitora Dibrugarh. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:underline hover:text-[color:var(--ink)] min-h-[44px] flex items-center px-2">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

