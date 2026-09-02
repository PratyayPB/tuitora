import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "teacher") {
        navigate("/teacher");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] py-16 px-5 flex items-center justify-center">
      <div className="bg-white rounded-3xl border border-[color:var(--border-earth)] p-8 sm:p-10 shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[color:var(--terracotta)] text-white grid place-items-center mx-auto mb-3">
            <GraduationCap size={24} />
          </div>
          <h1 className="font-display font-black text-2xl text-[color:var(--ink)]">Log in to Tuitora</h1>
          <p className="text-xs text-[color:var(--ink-soft)] mt-1">
            Access your student requirements or teacher portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[color:var(--ink-soft)] uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 border border-[color:var(--border-earth)] rounded-xl px-3 py-2.5">
              <Mail size={16} className="text-[color:var(--ink-soft)]" />
              <input
                data-testid="login-email-input"
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
              Password
            </label>
            <div className="flex items-center gap-2 border border-[color:var(--border-earth)] rounded-xl px-3 py-2.5">
              <Lock size={16} className="text-[color:var(--ink-soft)]" />
              <input
                data-testid="login-password-input"
                required
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
            data-testid="login-submit-btn"
            disabled={loading}
            className="rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-soft)] text-white mt-2 py-5"
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-[color:var(--border-earth)] text-xs text-[color:var(--ink-soft)]">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-[color:var(--terracotta)] font-semibold hover:underline">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
