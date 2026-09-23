import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("dtf_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("dtf_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("dtf_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (data) => {
    const res = await api.post("/auth/signup", data);
    localStorage.setItem("dtf_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("dtf_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
