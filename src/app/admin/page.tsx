"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Loader2, UserPlus, FolderPlus, Trash2, Video, CheckCircle, XCircle } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  father_name?: string;
  email: string;
  phone_number?: string;
  cnic?: string;
  city?: string;
  fee_status: string;
  course_slug?: string;
}

interface Course {
  id: number;
  title: string;
  mentor: string;
  duration: string;
  lessons: number;
}

interface VideoNode {
  id: number;
  course_id: number;
  name: string;
  duration: string;
  video_url: string;
  pdf_url?: string | null;
}

export default function AdminControlCenter() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<VideoNode[]>([]);

  // Forms Management States
  const [newUser, setNewUser] = useState({ id: "", name: "", email: "", status: "Unpaid" });
  const [newCourse, setNewCourse] = useState({ id: "", title: "", mentor: "", duration: "8 Weeks", lessons: "" });
  const [newLecture, setNewLecture] = useState({
    course_id: "",
    name: "",
    duration: "",
    video_url: "",
    pdf_url: ""
  });

  const fetchAdminData = async () => {
    setLoading(true);
    
    // Profiles table se student ka poora data fetch kar rahe hain
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, father_name, email, phone_number, cnic, city, fee_status, course_slug")
      .order("created_at", { ascending: false }); // Naye students sabse upar aayenge
      
    const { data: crs } = await supabase.from("courses").select("id, title, mentor, duration, lessons").order("id");
    const { data: vids } = await supabase.from("videos").select("id, course_id, name, duration, video_url, pdf_url").order("id", { ascending: false });
    
    if (profs) setProfiles(profs as Profile[]);
    if (crs) setCourses(crs);
    if (vids) setLectures(vids as any);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 🚀 LIVE APPROVAL SWITCHER: Ek click se student ka status badlein
  const handleToggleFeeStatus = async (id: string, currentStatus: string) => {
    setActionLoading(true);
    const nextStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        fee_status: nextStatus,
        fee_amount: nextStatus === "Paid" ? 15000 : 0 
      })
      .eq("id", id);

    if (error) {
      alert(`Approval Error: ${error.message}`);
    } else {
      alert(`Student profile updated to ${nextStatus}!`);
      await fetchAdminData(); // Interface instant refresh hojayega
    }
    setActionLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.id || !newUser.name || !newUser.email) return alert("Kindly fill all user fields.");
    setActionLoading(true);
    const { error } = await supabase.from("profiles").insert({
      id: newUser.id, full_name: newUser.name, email: newUser.email, role: "student", fee_status: newUser.status, fee_amount: newUser.status === "Paid" ? 15000 : 0
    });
    if (error) alert(`Error: ${error.message}`);
    else { alert("Student profile registered!"); setNewUser({ id: "", name: "", email: "", status: "Unpaid" }); fetchAdminData(); }
    setActionLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this student completely from LMS?")) return;
    setActionLoading(true);
    await supabase.from("enrollments").delete().eq("student_id", id);
    await supabase.from("profiles").delete().eq("id", id);
    fetchAdminData();
    setActionLoading(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.id || !newCourse.title || !newCourse.mentor) return alert("Fill course metadata.");
    setActionLoading(true);
    const { error } = await supabase.from("courses").insert({
      id: parseInt(newCourse.id), title: newCourse.title, mentor: newCourse.mentor, duration: newCourse.duration, lessons: parseInt(newCourse.lessons) || 12
    });
    if (error) alert(`Error: ${error.message}`);
    else { alert("Course deployed live!"); setNewCourse({ id: "", title: "", mentor: "", duration: "8 Weeks", lessons: "" }); fetchAdminData(); }
    setActionLoading(false);
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Wipe this course? This will remove all attachments!")) return;
    setActionLoading(true);
    await supabase.from("enrollments").delete().eq("course_id", id);
    await supabase.from("videos").delete().eq("course_id", id);
    await supabase.from("courses").delete().eq("id", id);
    fetchAdminData();
    setActionLoading(false);
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.course_id || !newLecture.name || !newLecture.video_url) {
      return alert("Target Course ID, Lecture Title, and Video URL are highly mandatory.");
    }

    setActionLoading(true);
    const { error } = await supabase.from("videos").insert({
      course_id: parseInt(newLecture.course_id),
      name: newLecture.name,
      duration: newLecture.duration || "15",
      video_url: newLecture.video_url,
      pdf_url: newLecture.pdf_url || null
    });

    if (error) {
      alert(`Asset Deploy Error: ${error.message}`);
    } else {
      alert("Lecture & digital assets linked successfully!");
      setNewLecture({ course_id: "", name: "", duration: "", video_url: "", pdf_url: "" });
      fetchAdminData();
    }
    setActionLoading(false);
  };

  const handleDeleteLecture = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lecture block?")) return;
    setActionLoading(true);
    await supabase.from("videos").delete().eq("id", id);
    fetchAdminData();
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#070707", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <Loader2 className="animate-spin text-blue-500" size={36} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#060608", color: "#f4f4f5", padding: "40px", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      {/* BRAND HEADER BAR */}
      <header style={{ maxWidth: "1600px", margin: "0 auto 40px auto", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f0f13", padding: "20px 32px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.03)" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>HRD CONTROL TOWER (DESK ENGINE)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#71717a", fontSize: "13px" }}>Student manual validation, batch control, and dynamic timeline injection.</p>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(59,130,246,0.05)", padding: "10px 18px", borderRadius: "14px", border: "1px solid rgba(59,130,246,0.1)", fontSize: "13px", color: "#3b82f6", fontWeight: "bold" }}>
            Total Registrations: {profiles.length}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(16,185,129,0.05)", padding: "10px 18px", borderRadius: "14px", border: "1px solid rgba(16,185,129,0.1)", fontSize: "13px", color: "#10b981", fontWeight: "bold" }}>
            Active Courses: {courses.length}
          </div>
        </div>
      </header>

      {/* OPERATIONS ARCHITECTURE GRID */}
      <main style={{ maxWidth: "1600px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "30px" }}>
        
        {/* COL 1: ADVANCED STUDENT MANAGEMENT LEDGER */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ backgroundColor: "#0f0f13", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#3b82f6", display: "flex", alignItems: "center", gap: "8px" }}>
                <UserPlus size={18}/> LIVE ENROLLMENT LEDGER
              </h2>
              <span style={{ fontSize: "11px", color: "#a1a1aa", backgroundColor: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "8px" }}>
                Pending Verification Check
              </span>
            </div>

            {/* LIVE DATA CONTAINER LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "750px", overflowY: "auto", paddingRight: "4px" }}>
              {profiles.length === 0 ? (
                <p style={{ textAlign: "center", color: "#71717a", fontSize: "13px", padding: "20px" }}>No student accounts found in system data records.</p>
              ) : (
                profiles.map(p => (
                  <div key={p.id} style={{ backgroundColor: "#141418", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    {/* Top Row Info */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ margin: 0, color: "#ffffff", fontSize: "15px", fontWeight: "bold" }}>{p.full_name} <span style={{ color: "#71717a", fontSize: "12px", fontWeight: "normal" }}>S/O {p.father_name || "N/A"}</span></h4>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#a1a1aa" }}>{p.email}</p>
                      </div>
                      
                      {/* Delete node shortcut */}
                      <button onClick={() => handleDeleteUser(p.id)} disabled={actionLoading} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }} title="Remove Student">
                        <Trash2 size={16}/>
                      </button>
                    </div>

                    {/* Metadata Specs Matrix */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", backgroundColor: "#0f0f13", padding: "10px", borderRadius: "10px", fontSize: "11px" }}>
                      <div><span style={{ color: "#71717a" }}>Phone:</span> <span style={{ color: "#f4f4f5", fontWeight: "600" }}>{p.phone_number || "N/A"}</span></div>
                      <div><span style={{ color: "#71717a" }}>CNIC:</span> <span style={{ color: "#f4f4f5", fontWeight: "600" }}>{p.cnic || "N/A"}</span></div>
                      <div><span style={{ color: "#71717a" }}>City:</span> <span style={{ color: "#f4f4f5", fontWeight: "600" }}>{p.city || "N/A"}</span></div>
                      <div><span style={{ color: "#71717a" }}>Course Path:</span> <span style={{ color: "#eab308", fontWeight: "bold", textTransform: "uppercase" }}>{p.course_slug || "Not Selected"}</span></div>
                    </div>

                    {/* Interactive Approval Action Ribbon */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#a1a1aa" }}>Status:</span>
                        <span style={{ 
                          fontSize: "11px", 
                          fontWeight: "bold", 
                          color: p.fee_status === "Paid" ? "#10b981" : "#f97316",
                          backgroundColor: p.fee_status === "Paid" ? "rgba(16,185,129,0.1)" : "rgba(249,115,22,0.1)",
                          padding: "3px 8px", 
                          borderRadius: "6px" 
                        }}>
                          {p.fee_status === "Paid" ? "✅ PAID (UNLOCKED)" : "⏳ UNPAID (LOCKED)"}
                        </span>
                      </div>

                      {/* Dynamic Approval Switch Action Switcher */}
                      <button
                        disabled={actionLoading}
                        onClick={() => handleToggleFeeStatus(p.id, p.fee_status)}
                        style={{
                          padding: "8px 14px",
                          backgroundColor: p.fee_status === "Paid" ? "rgba(239,68,68,0.1)" : "#10b981",
                          color: p.fee_status === "Paid" ? "#ef4444" : "#ffffff",
                          border: p.fee_status === "Paid" ? "1px solid rgba(239,68,68,0.2)" : "none",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.2s"
                        }}
                      >
                        {p.fee_status === "Paid" ? (
                          <>
                            <XCircle size={14} /> Lock Account Status
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} /> Approve Admission
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* COL 2: COURSE ARCHITECTURE CONTROLLER */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ backgroundColor: "#0f0f13", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, margin: "0 0 20px 0", color: "#10b981", display: "flex", alignItems: "center", gap: "8px" }}><FolderPlus size={18}/> BATCH BLUEPRINT DEPLOY</h2>
            <form onSubmit={handleAddCourse} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="number" placeholder="Unique Numeric Course ID" value={newCourse.id} onChange={e => setNewCourse({...newCourse, id: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <input type="text" placeholder="Blueprint Masterclass Title" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <input type="text" placeholder="Lead Instructor / Mentor" value={newCourse.mentor} onChange={e => setNewCourse({...newCourse, mentor: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <input type="number" placeholder="Syllabus Total Lectures Count" value={newCourse.lessons} onChange={e => setNewCourse({...newCourse, lessons: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <button type="submit" disabled={actionLoading} style={{ padding: "12px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>Deploy Batch</button>
            </form>
          </div>

          <div style={{ backgroundColor: "#0f0f13", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.03)", maxHeight: "400px", overflowY: "auto" }}>
            <span style={{ fontSize: "12px", color: "#71717a", fontWeight: "bold", textTransform: "uppercase" }}>Active Pipeline Branches</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              {courses.map(c => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#141418", padding: "10px 14px", borderRadius: "12px" }}>
                  <div><h6 style={{ margin: 0, color: "white" }}>{c.title}</h6><p style={{ margin: 0, fontSize: "10px", color: "#71717a" }}>ID: {c.id} • Mentor: {c.mentor}</p></div>
                  <button onClick={() => handleDeleteCourse(c.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COL 3: LECTURES & ATTACHED ASSET MANAGEMENT MANAGER */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ backgroundColor: "#0f0f13", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, margin: "0 0 20px 0", color: "#eab308", display: "flex", alignItems: "center", gap: "8px" }}><Video size={18}/> SYLLABUS & ASSET UPLOAD</h2>
            <form onSubmit={handleAddLecture} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="number" placeholder="Target Course ID (e.g. 1)" value={newLecture.course_id} onChange={e => setNewLecture({...newLecture, course_id: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <input type="text" placeholder="Lecture Title (e.g. Setting Up WordPress)" value={newLecture.name} onChange={e => setNewLecture({...newLecture, name: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <input type="number" placeholder="Duration (Minutes)" value={newLecture.duration} onChange={e => setNewLecture({...newLecture, duration: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <input type="text" placeholder="Video Link (YouTube Embed or direct URL)" value={newLecture.video_url} onChange={e => setNewLecture({...newLecture, video_url: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <input type="text" placeholder="Companion Notes Link (PDF, Zip, or Tool URL)" value={newLecture.pdf_url} onChange={e => setNewLecture({...newLecture, pdf_url: e.target.value})} style={{ padding: "12px", backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", color: "white", fontSize: "12px" }} />
              <button type="submit" disabled={actionLoading} style={{ padding: "12px", backgroundColor: "#eab308", color: "#000000", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>Push Asset Node</button>
            </form>
          </div>

          <div style={{ backgroundColor: "#0f0f13", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.03)", maxHeight: "400px", overflowY: "auto" }}>
            <span style={{ fontSize: "12px", color: "#71717a", fontWeight: "bold", textTransform: "uppercase" }}>Syllabus Asset Logs</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              {lectures.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#141418", padding: "10px 14px", borderRadius: "12px" }}>
                  <div style={{ maxWidth: "80%" }}>
                    <h6 style={{ margin: 0, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</h6>
                    <p style={{ margin: 0, fontSize: "10px", color: "#eab308" }}>Course ID: {l.course_id} • {l.duration}m</p>
                    {l.pdf_url && (
                      <span style={{ fontSize: "9px", backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "4px" }}>
                        Premium Asset Linked
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleDeleteLecture(l.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}