import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lock, Mail, User, Phone } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get("role") === "teacher" ? "teacher" : "student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signup({
        name,
        email,
        phone,
        password,
        role,
      });
      toast.success(`Welcome to Tuitora, ${user.name}!`);
      if (user.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] py-16 px-5 flex items-center justify-center">
      <div className="bg-white rounded-3xl border border-[color:var(--border-earth)] p-8 sm:p-10 shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[color:var(--terracotta)] text-white grid place-items-center mx-auto mb-3">
            <GraduationCap size={24} />
          </div>
          <h1 className="font-display font-black text-2xl text-[color:var(--ink)]">Create an Account</h1>
          <p className="text-xs text-[color:var(--ink-soft)] mt-1">
            Join Dibrugarh's verified home tuition network
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[color:var(--surface)] p-1 rounded-2xl mb-6 border border-[color:var(--border-earth)]">
          <button
            type="button"
            data-testid="signup-role-student"
            onClick={() => setRole("student")}
            className={`text-xs py-2 rounded-xl font-semibold transition-all ${role === "student" ? "bg-white text-[color:var(--ink)] shadow-sm" : "text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"}`}
          >
            I am a Student / Parent
          </button>
          <button
            type="button"
            data-testid="signup-role-teacher"
            onClick={() => setRole("teacher")}
            className={`text-xs py-2 rounded-xl font-semibold transition-all ${role === "teacher" ? "bg-white text-[color:var(--ink)] shadow-sm" : "text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"}`}
          >
            I am a Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <div className="flex items-center gap-2 border border-[color:var(--border-earth)] rounded-xl px-3 py-2.5">
              <User size={16} className="text-[color:var(--ink-soft)]" />
              <input
                data-testid="signup-name-input"
                required
                type="text"
                placeholder={role === "teacher" ? "Prof. / Dr. / Teacher Name" : "Parent or Student Name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 border border-[color:var(--border-earth)] rounded-xl px-3 py-2.5">
              <Mail size={16} className="text-[color:var(--ink-soft)]" />
              <input
                data-testid="signup-email-input"
                required
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-2 border border-[color:var(--border-earth)] rounded-xl px-3 py-2.5">
              <Phone size={16} className="text-[color:var(--ink-soft)]" />
              <input
                data-testid="signup-phone-input"
                required
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1">
              Password (min 6 chars)
            </label>
            <div className="flex items-center gap-2 border border-[color:var(--border-earth)] rounded-xl px-3 py-2.5">
              <Lock size={16} className="text-[color:var(--ink-soft)]" />
              <input
                data-testid="signup-password-input"
                required
                minLength={6}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-transparent outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            data-testid="signup-submit-btn"
            disabled={loading}
            className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] text-white mt-2 py-5"
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-[color:var(--border-earth)] text-xs text-[color:var(--ink-soft)]">
          Already have an account?{" "}
          <Link to="/login" className="text-[color:var(--terracotta)] font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
