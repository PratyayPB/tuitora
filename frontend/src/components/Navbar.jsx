import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, GraduationCap } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashPath =
    user?.role === "teacher" ? "/teacher" : user?.role === "admin" ? "/admin" : "/student";

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[color:var(--terracotta)] grid place-items-center text-white">
            <GraduationCap size={18} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-black text-[16px] tracking-tight">Tuitora</div>
            <div className="label-eyebrow !text-[9px] !tracking-[0.3em]">DIBRUGARH</div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/tutors" data-testid="nav-tutors" className="hover:text-[color:var(--terracotta)]">Find a Tutor</Link>
          {!user && <Link to="/signup?role=teacher" data-testid="nav-register-tutor" className="hover:text-[color:var(--terracotta)]">Register as Tutor</Link>}
          {user && (
            <Link to={dashPath} data-testid="nav-dashboard" className="flex items-center gap-1.5 hover:text-[color:var(--terracotta)]">
              <LayoutDashboard size={15}/> Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button asChild variant="ghost" data-testid="nav-login-btn"><Link to="/login">Log in</Link></Button>
              <Button asChild data-testid="nav-signup-btn" className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)]">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <span className="text-xs text-[color:var(--ink-soft)] hidden sm:inline" data-testid="nav-user-name">Hi, {user.name?.split(" ")[0]}</span>
              <Button variant="ghost" size="sm" data-testid="nav-logout-btn" onClick={() => { logout(); navigate("/"); }}>
                <LogOut size={15}/>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
