"use client";
import React, { useState, useEffect } from "react";
// 🛠️ FIX 1: Supabase import path ko exact system standard par set kiya
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { PlayCircle, BookOpen, Send, Loader2, LogOut, FileText } from "lucide-react";

interface Lecture {
  id: string;
  title: string;
  video_url: string;
  task_details: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [taskUrl, setTaskUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchLectures();
    };

    const fetchLectures = async () => {
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setLectures(data);
        setSelectedLecture(data[0]);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecture || !user || !taskUrl.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("student_progress").insert([
      {
        student_id: user.id,
        lecture_id: selectedLecture.id,
        is_completed: true,
        task_submission_url: taskUrl.trim(),
      },
    ]);

    if (error) {
      alert("Submission fail ho gayi: " + error.message);
    } else {
      alert("Assignment successfully submit ho gaya! 🔥");
      setTaskUrl("");
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#030303", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#030303", color: "#d4d4d8", fontFamily: "sans-serif", margin: 0, padding: 0, boxSizing: "border-box" }}>
      
      {/* HEADER NAVBAR */}
      {/* 🛠️ FIX 2: Layout key property ko standard uniform css par fix kiya */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.01)", backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", fontWeight: "bold", fontSize: "14px" }}>
            H
          </div>
          <span style={{ fontSize: "14px", fontWeight: "900", color: "#fff", letterSpacing: "1px", textTransform: "uppercase" }}>HRD Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
          <span style={{ fontSize: "12px", color: "#52525b" }}>{user?.email}</span>
          <button 
            onClick={handleLogout}
            style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#f87171", display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(239,68,68,0.05)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.1)", cursor: "pointer" }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* DASHBOARD CONTENT GRID */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        
        {/* LEFT COMPONENT: VIDEO & ASSIGNMENT */}
        <div style={{ gridColumn: lectures.length > 0 ? "span 2" : "span 3", display: "flex", flexDirection: "column", gap: "24px" }}>
          {selectedLecture ? (
            <>
              {/* VIDEO PLAYER SCREEN */}
              <div style={{ aspectRatio: "16/9", width: "100%", backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.7)" }}>
                <PlayCircle size={56} style={{ color: "#3b82f6", marginBottom: "12px" }} />
                <p style={{ fontSize: "15px", fontWeight: "900", color: "#fff", textTransform: "uppercase", margin: "0 16px", textAlign: "center" }}>
                  {selectedLecture.title}
                </p>
                <span style={{ fontSize: "10px", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "1px", marginTop: "6px" }}>
                  Streaming Token Node: Secure
                </span>
              </div>

              {/* ASSIGNMENT HUB */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff", marginBottom: "12px" }}>
                  <FileText size={18} style={{ color: "#fbbf24" }} />
                  <h3 style={{ fontSize: "13px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Today's Assignment Task</h3>
                </div>
                <p style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: "1.6", backgroundColor: "rgba(255,255,255,0.01)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", margin: "0 0 20px 0" }}>
                  {selectedLecture.task_details || "Is class ka koi task nahi hai."}
                </p>

                {/* SUBMIT FORM */}
                <form onSubmit={handleTaskSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#52525b" }}>
                    Submit Assignment Link (Drive / GitHub)
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <input
                      type="url" required placeholder="https://github.com/... or Google Drive link"
                      value={taskUrl} onChange={(e) => setTaskUrl(e.target.value)}
                      style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px", fontSize: "12px", color: "#fff", outline: "none" }}
                    />
                    <button
                      type="submit" disabled={submitting}
                      style={{ padding: "0 24px", borderRadius: "12px", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: submitting ? 0.5 : 1 }}
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Submit</>}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div style={{ height: "250px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#3f3f46", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "16px" }}>
              <BookOpen size={40} style={{ marginBottom: "8px" }} />
              <p style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>No Lecture Synchronized</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: CURRICULUM TIMELINE */}
        {lectures.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff", paddingLeft: "4px" }}>
              <BookOpen size={16} style={{ color: "#3b82f6" }} />
              <h2 style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Course Curriculum</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "70vh", overflowY: "auto" }}>
              {lectures.map((lecture, index) => (
                <button
                  key={lecture.id} onClick={() => setSelectedLecture(lecture)}
                  style={{ width: "100%", textAlign: "left", padding: "16px", borderRadius: "12px", border: selectedLecture?.id === lecture.id ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.04)", backgroundColor: selectedLecture?.id === lecture.id ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.01)", display: "flex", alignItems: "start", gap: "12px", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", backgroundColor: selectedLecture?.id === lecture.id ? "#3b82f6" : "rgba(255,255,255,0.05)", color: selectedLecture?.id === lecture.id ? "#fff" : "#71717a" }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "12px", fontWeight: "bold", color: selectedLecture?.id === lecture.id ? "#fff" : "#d4d4d8", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.2px", lineHeight: "1.3" }}>
                      {lecture.title}
                    </h4>
                    <span style={{ fontSize: "9px", color: "#52525b", textTransform: "uppercase", display: "block" }}>Class Module</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}