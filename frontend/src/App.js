import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import TutorSearch from "@/pages/TutorSearch";
import TutorDetail from "@/pages/TutorDetail";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import StudentDashboard from "@/pages/StudentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] flex flex-col font-sans text-[color:var(--ink)]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutors" element={<TutorSearch />} />
          <Route path="/tutors/:id" element={<TutorDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
