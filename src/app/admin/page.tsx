"use client";
import React, { useState, useEffect } from "react";
// 🛠️ FIX 1: Supabase import path ko bilkul accurate standard par set kiya
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { PlusCircle, Users, Video, ShieldCheck, Loader2, Check, X, DollarSign } from "lucide-react";

interface Student {
  id: string;
  email: string;
  is_approved: boolean;
  fees_status: "paid" | "pending";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Lecture Form State
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [taskDetails, setTaskDetails] = useState("");
  const [courseId, setCourseId] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        alert("Access Denied! Aap admin nahi hain.");
        router.push("/dashboard");
        return;
      }

      fetchStudents();
      fetchOrCreateCourse();
    };

    const fetchStudents = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, is_approved, fees_status")
        .eq("role", "student");
      
      if (data) setStudents(data);
    };

    const fetchOrCreateCourse = async () => {
      let { data: courses } = await supabase.from("courses").select("id").limit(1);
      
      if (courses && courses.length > 0) {
        setCourseId(courses[0].id);
      } else {
        const { data: newCourse } = await supabase
          .from("courses")
          .insert([{ title: "WordPress & SEO Masterclass", description: "Main Batch" }])
          .select()
          .single();
        if (newCourse) setCourseId(newCourse.id);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: !currentStatus })
      .eq("id", id);

    if (!error) {
      setStudents(students.map(s => s.id === id ? { ...s, is_approved: !currentStatus } : s));
    }
  };

  const toggleFees = async (id: string, currentStatus: "paid" | "pending") => {
    const nextStatus = currentStatus === "paid" ? "pending" : "paid";
    const { error } = await supabase
      .from("profiles")
      .update({ fees_status: nextStatus })
      .eq("id", id);

    if (!error) {
      setStudents(students.map(s => s.id === id ? { ...s, fees_status: nextStatus } : s));
    }
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl || !courseId) return;

    setFormLoading(true);
    const { error } = await supabase.from("lectures").insert([
      {
        course_id: courseId,
        title: title.trim(),
        video_url: videoUrl.trim(),
        task_details: taskDetails.trim(),
      },
    ]);

    if (error) {
      alert("Error adding class: " + error.message);
    } else {
      alert("Mubarak ho! Nayi class upload ho gayi. 🔥");
      setTitle("");
      setVideoUrl("");
      setTaskDetails("");
    }
    setFormLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#030303", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#030303", color: "#d4d4d8", padding: "32px", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      {/* ADMIN HEADER */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 40px auto", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px" }}>
        <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#fff", textTransform: "uppercase", margin: 0, letterSpacing: "-0.5px" }}>HQ Admin Control</h1>
          <p style={{ fontSize: "10px", color: "#52525b", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "2px", margin: 0 }}>LMS Core Administration</p>
        </div>
      </div>

      {/* TWO COLUMN INTERFACE */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
        
        {/* LECTURE UPLOADER FORM */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", height: "fit-content", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
            <Video size={18} style={{ color: "#3b82f6" }} />
            <h2 style={{ fontSize: "13px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Publish Daily Class</h2>
          </div>

          <form onSubmit={handleAddLecture} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", color: "#52525b" }}>Lecture Title</label>
              <input
                type="text" required placeholder="e.g., Lecture 04: WordPress Setup"
                value={title} onChange={(e) => setTitle(e.target.value)}
                style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", fontSize: "12px", color: "#fff", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", color: "#52525b" }}>Video Link (YouTube / Drive)</label>
              <input
                type="url" required placeholder="https://youtube.com/watch?v=..."
                value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", fontSize: "12px", color: "#fff", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", color: "#52525b" }}>Assignment Task Details</label>
              <textarea
                rows={4} placeholder="Write assignment instructions here..."
                value={taskDetails} onChange={(e) => setTaskDetails(e.target.value)}
                style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", fontSize: "12px", color: "#fff", outline: "none", resize: "none" }}
              />
            </div>

            <button
              type="submit" disabled={formLoading}
              style={{ padding: "14px", borderRadius: "12px", backgroundColor: "#fff", color: "#0a0a0a", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {formLoading ? <Loader2 size={14} className="animate-spin" /> : <><PlusCircle size={14} /> Launch Lecture</>}
            </button>
          </form>
        </div>

        {/* STUDENT ROSTER SECTION */}
        <div style={{ gridColumn: "span 1", minWidth: "100%", backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
            <Users size={18} style={{ color: "#fbbf24" }} />
            <h2 style={{ fontSize: "13px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Student Roster & Verification</h2>
          </div>

          <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
            {/* 🛠️ FIX 2: textAlignment property ko standard textAlign se replace kiya aur inline dynamic keys fix keen */}
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#71717a", fontFamily: "monospace", textTransform: "uppercase", fontSize: "10px" }}>
                  <th style={{ padding: "12px 16px", textTransform: "uppercase" }}>Student Email</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Fees</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#3f3f46", fontWeight: "bold", textTransform: "uppercase" }}>
                      No Students Registered Yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "16px", fontWeight: "500", color: "#fff" }}>{student.email}</td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "9px", fontFamily: "monospace", fontWeight: "bold", textTransform: "uppercase", backgroundColor: student.is_approved ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: student.is_approved ? "#34d399" : "#71717a", border: student.is_approved ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                          {student.is_approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "9px", fontFamily: "monospace", fontWeight: "bold", textTransform: "uppercase", backgroundColor: student.fees_status === "paid" ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)", color: student.fees_status === "paid" ? "#60a5fa" : "#f87171", border: student.fees_status === "paid" ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(239,68,68,0.2)" }}>
                          {student.fees_status}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", display: "flex", gap: "8px", justifyContent: "end" }}>
                        <button
                          onClick={() => toggleApproval(student.id, student.is_approved)}
                          style={{ padding: "6px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: student.is_approved ? "#f87171" : "#34d399", cursor: "pointer" }}
                        >
                          {student.is_approved ? <X size={14} /> : <Check size={14} />}
                        </button>
                        <button
                          onClick={() => toggleFees(student.id, student.fees_status)}
                          style={{ padding: "6px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "#a1a1aa", cursor: "pointer" }}
                        >
                          <DollarSign size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}