"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Award, BookOpen, ArrowRight, Loader2, CheckCircle, ShieldAlert, Lock, LogOut, User } from "lucide-react";

interface EnrolledCourse {
  course_id: number;
  progress: number;
  courses: {
    title: string;
    mentor: string;
    duration: string;
    lessons: number;
  } | null; // Database join safely handle karne ke liye fallback add kiya hy
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({ name: "Student", feeStatus: "Unpaid" });
  const [enrollment, setEnrollment] = useState<EnrolledCourse | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // 1. Student ka profile aur fee status fetch karein
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, fee_status")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile) {
          setStudent({ 
            name: profile.full_name || "Premium Student", 
            feeStatus: profile.fee_status || "Unpaid" 
          });
        }

        // 2. Sirf tabhi course fetch karein agar status 'Paid' ho
        if (profile && profile.fee_status === "Paid") {
          const { data: enrollData, error: enrollError } = await supabase
            .from("enrollments")
            .select(`
              progress, 
              course_id, 
              courses (
                title, 
                mentor, 
                duration, 
                lessons
              )
            `)
            .eq("student_id", user.id)
            .maybeSingle();

          if (enrollError) throw enrollError;

          if (enrollData) {
            setEnrollment(enrollData as any);
          }
        }
      } catch (error) {
        console.error("Dashboard Core Engine Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#070707", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", gap: "12px" }}>
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span style={{ fontSize: "14px", color: "#71717a", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>Loading Learning Pipeline Workspace...</span>
      </div>
    );
  }

  // Formatting helpers to prevent undefined properties rendering crash
  const hasValidCourse = enrollment && enrollment.courses;
  const courseTitle = enrollment?.courses?.title || "Assigned Masterclass Blueprint";
  const courseMentor = enrollment?.courses?.mentor || "Senior HRD Instructor";
  const courseDuration = enrollment?.courses?.duration || "Self-Paced Node";
  const courseLessons = enrollment?.courses?.lessons || 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0c", color: "#f4f4f5", padding: "32px", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      {/* NAVBAR */}
      <header style={{ maxWidth: "1250px", margin: "0 auto 50px auto", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111115", padding: "16px 28px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.03)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 900, fontSize: "16px", color: "#3b82f6", letterSpacing: "0.5px" }}>
          <Award size={20}/> HRD LEARNING PORTAL
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", backgroundColor: student.feeStatus === "Paid" ? "rgba(16,185,129,0.06)" : "rgba(244,63,94,0.06)", color: student.feeStatus === "Paid" ? "#10b981" : "#f43f5e", padding: "8px 16px", borderRadius: "100px", fontWeight: "bold", border: `1px solid ${student.feeStatus === "Paid" ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)"}` }}>
            {student.feeStatus === "Paid" ? <CheckCircle size={14}/> : <ShieldAlert size={14}/>} Status: {student.feeStatus}
          </span>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} 
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "8px 14px", borderRadius: "12px", color: "#a1a1aa", cursor: "pointer", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
          >
            <LogOut size={14}/> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1250px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
            <User size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>Welcome back, {student.name}! 👋</h1>
            <p style={{ color: "#71717a", fontSize: "14px", margin: "4px 0 0 0" }}>Your synchronized learning ledger matrix and lecture dashboard workspace.</p>
          </div>
        </div>

        <h2 style={{ fontSize: "12px", fontWeight: 800, color: "#3b82f6", letterSpacing: "1.5px", marginBottom: "24px", textTransform: "uppercase" }}>Your Active Allocation Route</h2>

        {/* 🔐 CONTAINER RENDERING ENGINE BASED ON PERMISSION NODE */}
        {student.feeStatus === "Paid" && hasValidCourse ? (
          <div style={{ maxWidth: "480px", backgroundColor: "#111115", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.04)", padding: "32px", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", backgroundColor: "rgba(59,130,246,0.08)", color: "#3b82f6", padding: "6px 14px", borderRadius: "100px", fontWeight: 800, border: "1px solid rgba(59,130,246,0.12)" }}>{courseDuration}</span>
              <span style={{ fontSize: "12px", color: "#71717a", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}><BookOpen size={14}/> {courseLessons} Syllabus Lectures</span>
            </div>

            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", margin: "0 0 8px 0", letterSpacing: "-0.3px", lineHeight: "1.3" }}>{courseTitle}</h3>
            <p style={{ fontSize: "14px", color: "#a1a1aa", margin: "0 0 32px 0" }}>Lead Mentor: <span style={{ color: "#ffffff", fontWeight: 600 }}>{courseMentor}</span></p>
            
            <div style={{ marginBottom: "32px", backgroundColor: "#18181c", padding: "18px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px" }}>
                <span style={{ color: "#71717a", fontWeight: 500 }}>Syndicate Course Progress</span>
                <span style={{ fontWeight: "bold", color: "#3b82f6" }}>{enrollment.progress}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: `${enrollment.progress}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "100px" }} />
              </div>
            </div>

            <button 
              onClick={() => router.push(`/dashboard/course/${enrollment.course_id}`)} 
              style={{ width: "100%", backgroundColor: "#3b82f6", border: "none", color: "#ffffff", padding: "16px", borderRadius: "16px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
            >
              Enter Cinema Lecture Space <ArrowRight size={16}/>
            </button>
          </div>
        ) : (
          /* 🚫 CINEMATIC LOCK PROTECTION HOLD SCREEN */
          <div style={{ padding: "50px 32px", backgroundColor: "#111115", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.03)", color: "#a1a1aa", textAlign: "center", maxWidth: "550px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ backgroundColor: "rgba(234,88,12,0.08)", padding: "16px", borderRadius: "50%", color: "#ea580c", border: "1px solid rgba(234,88,12,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={26} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3 style={{ color: "white", margin: 0, fontSize: "18px", fontWeight: 800, letterSpacing: "-0.2px" }}>Portal Access Pending Approval</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#71717a", lineHeight: "1.6", padding: "0 10px" }}>
                Aapka account system mein successfully map ho gaya hai. Lekin security protocol ke tahat jab tak Admin verify karke aapko specific Course Node ki permission manual allot nahi karte, tab tak pipeline locked rahegi.
              </p>
              <span style={{ color: "#ea580c", fontWeight: 700, fontSize: "13px", display: "block", marginTop: "12px", letterSpacing: "0.5px" }}>
                Kindly connect with the HRD Management Desk.
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}