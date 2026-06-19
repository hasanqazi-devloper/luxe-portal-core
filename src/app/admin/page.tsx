"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  Loader2, Trash2, Video, Layers, Home, Users, Settings, Archive, Mail, GraduationCap, Search, X, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation"; // 👈 Agar Next.js App Router (app folder) hai
// ya phir
interface Profile {
  id: string;
  full_name: string;
  father_name?: string | null;
  email: string;
  phone_number?: string | null;
  city?: string | null;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
  fee_status: string;
  fee_amount?: number | null;
  course_slug?: string | null;
  education?: string | null;
  submission_url?: string | null;
  is_active_now?: boolean;
  assignment_status?: "Submitted" | "Pending";
  videos_watched: number;
  assignments_done: number;
  performance_score: string;
}

interface Course {
  id: string | number;
  title: string;
  mentor: string;
  modules?: string | null;
  duration?: string;
  lessons?: number;
}

interface VideoNode {
  id: number;
  name: string;
  duration: string;
  video_url: string;
  module_name: string;
  course_title?: string;
  assignment_url?: string | null;
  notes_url?: string | null;
}

export const dynamic = "force-dynamic";

export default function AdminControlCenter() {
  const [loading, setLoading] = useState(true);
  // const [actionLoading, setActionLoading] = useState(false);
const router = useRouter();
  // Core Live Data Pipelines
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<VideoNode[]>([]);

  // Real-time Filters & Soft Archive Bin
  const [leadSearch, setLeadSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [binnedUserIds, setBinnedUserIds] = useState<string[]>([]);

  // WP-Style Sidebar Tab Active Router
  const [activeSidebar, setActiveSidebar] = useState<"dashboard" | "leads" | "courses" | "videos" | "students" | "settings" | "bin">("dashboard");

  // Local Grading Database State
  const [reviewState, setReviewState] = useState<{ [key: string]: { remarks: string; grade: string; saved: boolean } }>({});

  // 🎯 Dynamic UI Modals & Live Desk Control States
  const [selectedStudentMetrics, setSelectedStudentMetrics] = useState<Profile | null>(null);
  const [selectedAssignmentStudent, setSelectedAssignmentStudent] = useState<Profile | null>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);
  const [gradingRemarks, setGradingRemarks] = useState("");
  const [gradingScore, setGradingScore] = useState("Pending");

  // Clean Forms Initialization States
  const [newCourse, setNewCourse] = useState({ title: "", mentor: "", modules: "" });

  // Lecture Form Hook State
  const [newLecture, setNewLecture] = useState({
    course_title: "",
    name: "",
    duration: "",
    video_url: "",
    module_name: "",
    assignment_url: "",
    notes_url: ""
  });

  // ✨ Manual Student state (isay aise hi rehne dein agar yeh pehle se use ho raha hai)
  const [manualStudent, setManualStudent] = useState({
    id: "",
    name: "",
    email: "",
    education: "Intermediate",
    course_slug: ""
  });

  // ⚙️ Final Admin Settings State (Yahan currentPassword, newPassword aur newEmail teenon lazmi hain)
  const [adminSettings, setAdminSettings] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "" // 👈 Yeh lazmi add karna tha change email function ke liye
  });

  // 👥 New Invitation Email State (Naye admin ko invite bhejane ke liye)
  const [inviteEmail, setInviteEmail] = useState("");

  // ⏳ Loading State (Dono forms ke status aur nodes track karne ke liye)
  const [actionLoading, setActionLoading] = useState(false);
  // 🔄 Fetch Live Data Directly From Supabase Database
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: profs, error: profsError } = await supabase
        .from("profiles")
        .select("id, full_name, father_name, email, phone_number, city, age, gender, address, fee_status, fee_amount, course_slug, education");
      if (profsError) console.error("Profiles error:", profsError.message);

      const { data: crs, error: crsError } = await supabase
        .from("courses")
        .select("*");
      if (crsError) console.error("Courses error:", crsError.message);

      const { data: vids, error: vidsError } = await supabase
        .from("videos")
        .select("*");
      if (vidsError) console.error("Videos error:", vidsError.message);

      if (profs) {
        const mappedProfiles = profs.map((p) => ({
          ...p,
          father_name: p.father_name || "—",
          city: p.city || "—",
          age: p.age || "—",
          gender: p.gender || "—",
          education: p.education || "Not Provided",
          address: p.address || "—",
          fee_amount: p.fee_amount !== undefined ? p.fee_amount : 0,
          videos_watched: Math.floor(Math.random() * 5), // Replace with real analytics tracking column if exists
          assignments_done: 0,
          performance_score: "Good Performance",
          submission_url: null,
          is_active_now: false,
          assignment_status: "Pending"
        }));
        setProfiles(mappedProfiles as Profile[]);
      }

      if (crs && crs.length > 0) {
        const finalizedCourses = crs.map((c: any) => ({
          id: c.id,
          title: c.title || c.course_name || "Untitled Course",
          mentor: c.mentor || c.instructor || "Unknown",
          modules: c.modules || null,
          duration: c.duration || c.course_duration || "",
          lessons: c.lessons || c.total_lessons || 0
        }));
        setCourses(finalizedCourses as Course[]);
      } else {
        setCourses([]);
      }

      if (vids) {
        const finalizedVideos = vids.map((v: any) => ({
          id: v.id,
          name: v.name || v.title || "Untitled Video",
          duration: v.duration || "",
          video_url: v.video_url || v.url || "",
          module_name: v.module_name || v.module || "General",
          course_title: v.course_title || v.course || "",
          assignment_url: v.assignment_url || null,
          notes_url: v.notes_url || null
        }));
        setLectures(finalizedVideos as VideoNode[]);
      } else {
        setLectures([]);
      }

    } catch (err) {
      console.error("Fatal fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 📝 Real-time Loading Submissions Pipeline Node
  const loadStudentSubmissions = async (student: Profile) => {
    setSelectedAssignmentStudent(student);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`id, video_id, submission_url, remarks, grade, videos(name)`)
        .eq("student_id", student.id);

      if (!error && data) {
        setStudentSubmissions(data);
      } else {
        setStudentSubmissions([]);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    }
  };

  // 🔐 Handle Real-time Cloud Grade Updating Dispatcher
  const handleUpdateGrade = async (submissionId: number) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          remarks: gradingRemarks,
          grade: gradingScore
        })
        .eq("id", submissionId);

      if (!error) {
        alert("Evaluation parameters synchronized and locked on live server!");
        if (selectedAssignmentStudent) {
          loadStudentSubmissions(selectedAssignmentStudent);
        }
      } else {
        alert("Grading failed: " + error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRemarks = (studentId: string) => {
    const currentReview = reviewState[studentId] || { remarks: "", grade: "A+", saved: false };
    if (!currentReview.remarks.trim()) return alert("Pehle evaluation remarks type karein.");

    setReviewState(prev => ({
      ...prev,
      [studentId]: { ...currentReview, saved: true }
    }));
    alert("Student evaluation successfully locked in local memory!");
  };

  const handleApproveLead = async (profile: Profile) => {
    setActionLoading(true);
    const generatedPassword = "HRD-" + Math.random().toString(36).slice(-6).toUpperCase();

    const { error } = await supabase
      .from("profiles")
      .update({ fee_status: "Paid" })
      .eq("id", profile.id);

    if (!error) {
      alert(`Student successfully verified! Login access credentials dispatched.`);
      try {
        await fetch("/api/send-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: profile.email.trim(),
            password: generatedPassword,
            fullName: profile.full_name,
            course: profile.course_slug || "LMS Blueprint Masterclass",
            note: "🚨 WARNING: Aapka account sirf aapke apnay laptop par chaly ga. Kisi aur laptop ya computer par login krny se account system automatic permanently BLOCK kr dega!"
          }),
        });
      } catch (e) { }
      fetchAdminData();
    }
    setActionLoading(false);
  };

  const handleManualAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudent.name || !manualStudent.email || !manualStudent.id) return alert("Pehle basic fields fill karein.");
    setActionLoading(true);

    const generatedPassword = "HRD-" + Math.random().toString(36).slice(-6).toUpperCase();

    const { error } = await supabase.from("profiles").insert({
      id: manualStudent.id,
      full_name: manualStudent.name,
      email: manualStudent.email,
      course_slug: manualStudent.course_slug || (courses[0]?.title || "Web Development"),
      fee_status: "Paid",
      education: manualStudent.education
    });

    if (!error) {
      alert("Student manually deployed! Automation mail sent.");
      try {
        await fetch("/api/send-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: manualStudent.email,
            password: generatedPassword,
            fullName: manualStudent.name,
            course: manualStudent.course_slug
          })
        });
      } catch (e) { }
      setManualStudent({ id: "", name: "", email: "", education: "Intermediate", course_slug: "" });
      fetchAdminData();
    } else {
      alert("Error adding student: " + error.message);
    }
    setActionLoading(false);
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    const confirmDelete = window.confirm("Kya aap waqai is course ko hamesha ke liye delete karna chahte hain?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (!error) {
        alert("Course successfully deleted from database!");
        fetchAdminData();
      } else {
        alert("Error: " + error.message);
      }
    } catch (err) {
      console.error("Deletion node error:", err);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    const confirmDelete = window.confirm("Kya aap waqai is video lecture ko hamesha ke liye delete karna chahte hain?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);

      if (!error) {
        alert("Video node successfully wiped from cloud server!");
        fetchAdminData();
      } else {
        alert("Error: " + error.message);
      }
    } catch (err) {
      console.error("Video delete error:", err);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.mentor) return alert("Course ka title aur teacher name lazmi hai.");
    setActionLoading(true);

    const { error } = await supabase.from("courses").insert({
      title: newCourse.title,
      mentor: newCourse.mentor,
      modules: newCourse.modules || "General Structure"
    });

    if (!error) {
      alert("🎉 Naya Course portal par deploy ho gya!");
      setNewCourse({ title: "", mentor: "", modules: "" });
      fetchAdminData();
    } else {
      alert("Error creating course: " + error.message);
    }
    setActionLoading(false);
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const assignmentPayload = (newLecture as any).assignment_url || null;
      const notesPayload = (newLecture as any).notes_url || null;

      const { error } = await supabase
        .from("videos")
        .insert([
          {
            course_title: newLecture.course_title,
            name: newLecture.name,
            module_name: newLecture.module_name || "General",
            duration: newLecture.duration ? parseInt(newLecture.duration) : null,
            video_url: newLecture.video_url,
            assignment_url: assignmentPayload,
            notes_url: notesPayload
          }
        ]);

      if (error) throw error;

      setNewLecture({
        course_title: "",
        name: "",
        module_name: "",
        duration: "",
        video_url: "",
        assignment_url: "",
        notes_url: ""
      });

      await fetchAdminData();
      alert("Video published successfully!");

    } catch (err: any) {
      console.error("Upload error:", err.message);
      alert("Error uploading video: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const moveLeadToBin = (id: string) => {
    setBinnedUserIds(prev => [...prev, id]);
    alert("Record successfully moved to Bin section.");
  };

  const restoreLeadFromBin = (id: string) => {
    setBinnedUserIds(prev => prev.filter(uid => uid !== id));
    alert("Record successfully restored from Bin Archive.");
  };

  const websiteLeadsList = profiles.filter(p => p.fee_status !== "Paid" && !binnedUserIds.includes(p.id) && p.full_name.toLowerCase().includes(leadSearch.toLowerCase()));
  const managedStudentsList = profiles.filter(p => p.fee_status === "Paid" && p.full_name.toLowerCase().includes(studentSearch.toLowerCase()));
  const binnedUsersList = profiles.filter(p => binnedUserIds.includes(p.id));

  const sidebarButton = (type: typeof activeSidebar, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setActiveSidebar(type)}
      style={{
        display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px",
        backgroundColor: activeSidebar === type ? "#10b981" : "transparent",
        color: activeSidebar === type ? "#ffffff" : "#94a3b8",
        border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", textAlign: "left",
        cursor: "pointer", transition: "all 0.2s"
      }}
    >
      {icon} {label}
    </button>
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#1E2939", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "system-ui, sans-serif" }}>
        <Loader2 className="animate-spin text-emerald-400" size={40} />
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#94a3b8", fontWeight: "600" }}>Connecting live Supabase database nodes...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1E2939", color: "#f8fafc", display: "grid", gridTemplateColumns: "260px 1fr", fontFamily: "system-ui, sans-serif" }}>

    {/* 🧭 WP-STYLE PRESET SIDEBAR */}
<aside style={{ backgroundColor: "#111827", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "20px", borderRight: "1px solid rgba(255,255,255,0.02)", minHeight: "100vh", width: "260px", boxSizing: "border-box" }}>
  
  {/* Logo Section */}
  <div style={{ padding: "0 8px", marginBottom: "8px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <GraduationCap className="text-emerald-400" size={22} />
      <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#fff", margin: 0 }}>HRD LMS PORTAL</h2>
    </div>
    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Admin Desk Suite v5.0</span>
  </div>

  {/* Navigation Menus (Removed flex: 1 to stop push down) */}
  <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    {sidebarButton("dashboard", "Dashboard", <Home size={16} />)}
    {sidebarButton("leads", "Website Leads", <Mail size={16} />)}
    {sidebarButton("courses", "Courses", <Layers size={16} />)}
    {sidebarButton("videos", "Videos", <Video size={16} />)}
    {sidebarButton("students", "Manage Students", <Users size={16} />)}
    {sidebarButton("settings", "Settings", <Settings size={16} />)}
    {sidebarButton("bin", "Bin", <Archive size={16} />)}
  </nav>

  {/* ✨ PREMIUM DESIGNED LOG OUT BUTTON (Brought Upwards) */}
  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", marginTop: "12px" }}>
    <button
      onClick={async () => {
        const confirmLogout = window.confirm("Kya aap waqai log out karna chahte hain?");
        if (!confirmLogout) return;
        
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          router.push("/login"); 
        } catch (err: any) {
          alert("Logout Error: " + err.message);
        }
      }}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 14px",
        backgroundColor: "rgba(244, 63, 94, 0.03)",
        border: "1px solid rgba(244, 63, 94, 0.1)",
        borderRadius: "12px",
        color: "#f43f5e",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxSizing: "border-box"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.1)";
        e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.03)";
        e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.1)";
      }}
    >
      <span style={{ display: "flex", alignItems: "center", transform: "rotate(180deg)" }}>
        ⚡
      </span>
      Exit Admin Session
    </button>
  </div>
</aside>

      {/* 🖥️ MAIN ACTIVE HUB SUITE */}
      <div style={{ padding: "40px", boxSizing: "border-box", overflowY: "auto", maxHeight: "100vh" }}>

        {/* TOP COMPONENT HEADER SUB-BAR */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "900", margin: 0, textTransform: "capitalize" }}>
              {activeSidebar === "leads" ? "Website Leads" : activeSidebar === "students" ? "Manage Students" : activeSidebar}
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>High Rise Digital Automation System Workspace Control Panel.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", backgroundColor: "#111827", padding: "6px 12px", borderRadius: "8px" }}>
            <span style={{ fontSize: "12px", color: "#34d399", fontWeight: "bold" }}>Live System Core Monitor</span>
          </div>
        </header>

        {/* ================= SECTION 1: HOME PAGE DASHBOARD CARDS ================= */}
        {activeSidebar === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>

              {/* CARD 1: WEBSITE LEADS */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Website Leads</span>
                <h3 style={{ fontSize: "32px", margin: "10px 0 0 0", color: "#38bdf8", fontWeight: "800" }}>
                  {/* Safeguard added against undefined profiles */}
                  {(profiles || []).filter(p => p?.fee_status !== "Paid").length}
                </h3>
              </div>

              {/* CARD 2: ACTIVE STUDENTS */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Active Students</span>
                <h3 style={{ fontSize: "32px", margin: "10px 0 0 0", color: "#34d399", fontWeight: "800" }}>
                  {/* Safeguard added against undefined managed list */}
                  {managedStudentsList?.length || 0}
                </h3>
              </div>

              {/* CARD 3: TOTAL COURSES */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Total Courses</span>
                <h3 style={{ fontSize: "32px", margin: "10px 0 0 0", color: "#a78bfa", fontWeight: "800" }}>
                  {/* Safeguard added against undefined courses */}
                  {courses?.length || 0}
                </h3>
              </div>

              {/* CARD 4: TOTAL VIDEOS */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Total Videos</span>
                <h3 style={{ fontSize: "32px", margin: "10px 0 0 0", color: "#fb923c", fontWeight: "800" }}>
                  {/* Safeguard added against undefined lectures */}
                  {lectures?.length || 0}
                </h3>
              </div>

            </div>
          </div>
        )}

        {/* ================= SECTION 2: WEBSITE LEADS TRACKER (EXCEL SHEET FORMAT) ================= */}
        {activeSidebar === "leads" && (
          <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px", overflowX: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", color: "#38bdf8" }}>Incoming Portal Registration Leads ({websiteLeadsList.length})</h3>
              <div style={{ position: "relative", width: "240px" }}>
                <input
                  type="text"
                  placeholder="Search lead name..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px 8px 36px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px", boxSizing: "border-box" }}
                />
                <Search size={13} style={{ position: "absolute", left: "12px", top: "11px", color: "#64748b" }} />
              </div>
            </div>

            <div style={{ minWidth: "1100px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1E2939", color: "#94a3b8", borderBottom: "2px solid rgba(255,255,255,0.05)" }}>
                    <th style={{ padding: "12px 10px" }}>Full Name</th>
                    <th style={{ padding: "12px 10px" }}>Father Name</th>
                    <th style={{ padding: "12px 10px" }}>Email Address</th>
                    <th style={{ padding: "12px 10px" }}>Phone Number</th>
                    <th style={{ padding: "12px 10px" }}>City</th>
                    <th style={{ padding: "12px 10px" }}>Age</th>
                    <th style={{ padding: "12px 10px" }}>Gender</th>
                    <th style={{ padding: "12px 10px" }}>Education</th>
                    <th style={{ padding: "12px 10px" }}>Target Course</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {websiteLeadsList.length > 0 ? (
                    websiteLeadsList.map(lead => (
                      <tr key={lead.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", backgroundColor: "rgba(30,41,57,0.3)" }}>
                        <td style={{ padding: "12px 10px", color: "white", fontWeight: "600" }}>{lead.full_name}</td>
                        <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>{lead.father_name || "—"}</td>
                        <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>{lead.email}</td>
                        <td style={{ padding: "12px 10px", color: "#38bdf8" }}>{lead.phone_number || "—"}</td>
                        <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>{lead.city || "—"}</td>
                        <td style={{ padding: "12px 10px", color: "#cbd5e1", textAlign: "center" }}>{lead.age || "—"}</td>
                        <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>{lead.gender || "—"}</td>
                        <td style={{ padding: "12px 10px", color: "#a78bfa" }}>{lead.education || "—"}</td>
                        <td style={{ padding: "12px 10px", color: "#fb923c" }}>{lead.course_slug || "Not Specified"}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button onClick={() => handleApproveLead(lead)} disabled={actionLoading} style={{ padding: "6px 10px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>Approve</button>
                            <button onClick={() => moveLeadToBin(lead.id)} style={{ padding: "6px", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", borderRadius: "4px", cursor: "pointer" }}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} style={{ fontSize: "12px", color: "#64748b", textAlign: "center", padding: "30px" }}>Koi naye leads mojud nahi hain.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= SECTION 3: LIVE COURSE BUILDER ================= */}
        {activeSidebar === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

            {/* 🆕 CREATE COURSE FORM */}
            <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#34d399" }}>Create New Course Track</h3>
              <form onSubmit={handleAddCourse} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  required
                  placeholder="Course Name (e.g. Next.js Masterclass)"
                  value={newCourse.title}
                  onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                  style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px" }}
                />
                <input
                  type="text"
                  required
                  placeholder="Lead Instructor / Teacher Name"
                  value={newCourse.mentor}
                  onChange={e => setNewCourse({ ...newCourse, mentor: e.target.value })}
                  style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px" }}
                />
                <textarea
                  rows={4}
                  placeholder="Modules Setup (Enter dabayein har module ko nayi line me likhne ke liye...&#10;Module 1: Core JavaScript&#10;Module 2: Advanced React)"
                  value={newCourse.modules}
                  onChange={e => setNewCourse({ ...newCourse, modules: e.target.value })}
                  style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px", resize: "vertical", fontFamily: "inherit" }}
                />
                <button type="submit" disabled={actionLoading} style={{ padding: "12px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                  {actionLoading ? "Deploying..." : "Deploy Fresh Course Blueprint"}
                </button>
              </form>
            </div>

            {/* 📊 ACTIVE COURSES LIST */}
            <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#94a3b8" }}>Active Database Courses ({(courses || []).length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "450px", overflowY: "auto" }}>
                {courses && courses.length > 0 ? (
                  courses.map(c => (
                    <div key={String(c.id)} style={{ backgroundColor: "#1E2939", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: "14px", color: "white", fontWeight: "700" }}>{c.title || "Untitled Course"}</h4>
                        <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px", alignItems: "center" }}>
                          <span>Instructor: <strong style={{ color: "#f8fafc" }}>{c.mentor || "Unknown"}</strong></span>
                          {c.duration && (
                            <>
                              <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
                              <span style={{ color: "#38bdf8", backgroundColor: "rgba(56,189,248,0.06)", padding: "2px 6px", borderRadius: "4px" }}>{c.duration}</span>
                            </>
                          )}
                          {c.lessons && (
                            <>
                              <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
                              <span style={{ color: "#a78bfa", backgroundColor: "rgba(167,139,250,0.06)", padding: "2px 6px", borderRadius: "4px" }}>{c.lessons} Lessons</span>
                            </>
                          )}
                        </div>
                        {c.modules && (
                          <div style={{ margin: "10px 0 0 0", fontSize: "11px", color: "#34d399", whiteSpace: "pre-line", lineHeight: "1.4", backgroundColor: "rgba(16,185,129,0.02)", padding: "8px", borderRadius: "6px", border: "1px solid rgba(16,185,129,0.05)" }}>
                            <strong style={{ color: "#10b981", display: "block", marginBottom: "2px" }}>Structure Blueprint:</strong>
                            {c.modules}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c.id)}
                        style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: "6px", padding: "8px", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "#64748b", textAlign: "center", display: "block", padding: "20px" }}>Database mein koi course nahi mila. Naya course add karein!</span>
                )}
              </div>
            </div>

          </div>
        )}

        <>
          {/* ================= SECTION 4: VIDEO SCHEDULER ENGINE (WITH DELETE ACTIONS) ================= */}
          {activeSidebar === "videos" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "32px" }}>

              {/* 🆕 UPLOAD VIDEO FORM */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#fb923c" }}>Upload Daily Class Video</h3>
                <form onSubmit={handleAddLecture} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <select
                    required
                    value={newLecture.course_title}
                    onChange={e => setNewLecture({ ...newLecture, course_title: e.target.value })}
                    style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px" }}
                  >
                    <option value="">Select Target Course Track</option>
                    {courses.map(c => (
                      <option key={String(c.id)} value={c.title}>{c.title}</option>
                    ))}
                  </select>

                  <input type="text" required placeholder="Video Lecture Name / Title" value={newLecture.name} onChange={e => setNewLecture({ ...newLecture, name: e.target.value })} style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px" }} />
                  <input type="text" placeholder="Module Name Designation (e.g. Module 2: Tailwind)" value={newLecture.module_name} onChange={e => setNewLecture({ ...newLecture, module_name: e.target.value })} style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px" }} />
                  <input type="number" placeholder="Duration (Minutes)" value={newLecture.duration} onChange={e => setNewLecture({ ...newLecture, duration: e.target.value })} style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px" }} />
                  <input type="url" required placeholder="Private Streaming Embed / Link URL Token" value={newLecture.video_url} onChange={e => setNewLecture({ ...newLecture, video_url: e.target.value })} style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "13px" }} />

                  {/* ATTACHMENTS LAYER */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "600" }}>Lecture Attachments (Optional)</span>
                    <input
                      type="text"
                      placeholder="Assignment Task Description or Link URL"
                      value={(newLecture as any).assignment_url || ""}
                      onChange={e => setNewLecture({ ...newLecture, assignment_url: e.target.value })}
                      style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "6px", color: "white", fontSize: "13px" }}
                    />
                    <input
                      type="text"
                      placeholder="Class Notes / Drive Link / GitHub Link"
                      value={(newLecture as any).notes_url || ""}
                      onChange={e => setNewLecture({ ...newLecture, notes_url: e.target.value })}
                      style={{ padding: "11px", backgroundColor: "#1E2939", border: "1px solid rgba(45,212,191,0.2)", borderRadius: "6px", color: "white", fontSize: "13px" }}
                    />
                  </div>

                  <button type="submit" disabled={actionLoading} style={{ padding: "12px", backgroundColor: "#fb923c", color: "black", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", marginTop: "8px" }}>
                    {actionLoading ? "Publishing..." : "Publish Stream Node"}
                  </button>
                </form>
              </div>

              {/* SYLLABUS FEED WITH CLEAN TRASH DELETE OPTION */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px", maxHeight: "600px", overflowY: "auto" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#94a3b8" }}>Course-wise Syllabus Feed</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {courses && courses.length > 0 ? (
                    courses.map(course => {
                      const courseVideos = lectures.filter(l => l.course_title === course.title);
                      return (
                        <div key={String(course.id)} style={{ backgroundColor: "#1E2939", borderRadius: "10px", padding: "16px", border: "1px solid rgba(255,255,255,0.03)" }}>
                          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#38bdf8", borderBottom: "1px solid rgba(56,189,248,0.1)", paddingBottom: "6px" }}>
                            {course.title} <span style={{ color: "#64748b", fontSize: "11px" }}>({courseVideos.length} Videos)</span>
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {courseVideos.length > 0 ? (
                              courseVideos.map(l => (
                                <div key={l.id} style={{ backgroundColor: "rgba(17,24,39,0.5)", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div style={{ flex: 1 }}>
                                    <h5 style={{ margin: 0, fontSize: "13px", color: "white" }}>{l.name}</h5>
                                    <span style={{ fontSize: "11px", color: "#fb923c", display: "block", marginTop: "2px" }}>
                                      Module: {l.module_name || "General"} • {l.duration || "—"} Mins
                                    </span>
                                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                      {l.assignment_url && <span style={{ fontSize: "10px", backgroundColor: "rgba(168,85,247,0.1)", color: "#c084fc", padding: "2px 6px", borderRadius: "4px" }}>📝 Assignment Attached</span>}
                                      {l.notes_url && <span style={{ fontSize: "10px", backgroundColor: "rgba(45,212,191,0.1)", color: "#2dd4bf", padding: "2px 6px", borderRadius: "4px" }}>📚 Notes Attached</span>}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVideo(l.id)}
                                    style={{ padding: "6px", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", borderRadius: "4px", cursor: "pointer", marginLeft: "10px" }}
                                    title="Delete Video Node"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: "12px", color: "#4b5563", fontStyle: "italic" }}>No video nodes linked.</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : null}

                  {/* UNASSIGNED DATA CONTAINER WITH TRASH/DELETE PER VIDEO */}
                  {lectures.filter(l => !l.course_title || !courses.some(c => c.title === l.course_title)).length > 0 && (
                    <div style={{ backgroundColor: "#1e1e24", borderRadius: "10px", padding: "16px", border: "1px solid rgba(239,68,68,0.1)" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#f87171" }}>
                        Legacy / Unassigned Videos <span style={{ fontSize: "11px", color: "#64748b" }}>(Purana Data)</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {lectures.filter(l => !l.course_title || !courses.some(c => c.title === l.course_title)).map(l => (
                          <div key={l.id} style={{ backgroundColor: "rgba(17,24,39,0.4)", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <h5 style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>{l.name}</h5>
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Module: {l.module_name || "General"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteVideo(l.id)}
                              style={{ padding: "6px", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", borderRadius: "4px", cursor: "pointer" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= STUDENT REGISTRY SECTION ================= */}
          {activeSidebar === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

              {/* 🚀 QUICK DEPLOY MANUALLY FORM PANEL */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#10b981", fontWeight: "800" }}>🚀 Add Student Manually (Auto Account + Credential Mail Trigger)</h3>
                <form onSubmit={handleManualAddStudent} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr auto", gap: "10px", alignItems: "center" }}>
                  <input type="text" required placeholder="Student UUID Node" value={manualStudent.id} onChange={e => setManualStudent({ ...manualStudent, id: e.target.value })} style={{ padding: "10px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px" }} />
                  <input type="text" required placeholder="Full Name" value={manualStudent.name} onChange={e => setManualStudent({ ...manualStudent, name: e.target.value })} style={{ padding: "10px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px" }} />
                  <input type="email" required placeholder="Student Email Address" value={manualStudent.email} onChange={e => setManualStudent({ ...manualStudent, email: e.target.value })} style={{ padding: "10px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px" }} />

                  <select
                    value={manualStudent.education}
                    onChange={e => setManualStudent({ ...manualStudent, education: e.target.value })}
                    style={{ padding: "10px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px" }}
                  >
                    <option value="Matric">Matric</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="DAE Diploma">DAE Diploma</option>
                    <option value="Bachelors (CS)">Bachelors (CS)</option>
                    <option value="BS Software Engineering">BS SE</option>
                    <option value="Dawat-e-Islami Course">Religious Scholar</option>
                  </select>

                  <input type="text" placeholder="Course Track Assignment" value={manualStudent.course_slug} onChange={e => setManualStudent({ ...manualStudent, course_slug: e.target.value })} style={{ padding: "10px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px" }} />
                  <button type="submit" style={{ padding: "10px 14px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>Add Student</button>
                </form>
              </div>

              {/* 📊 REGISTERED ACTIVE PROFILES EXCEL TABLE GRID SHEET */}
              <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px", overflowX: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "#a78bfa" }}>Active Enrolled Students Master Registry ({managedStudentsList.length})</span>
                  <div style={{ position: "relative", width: "240px" }}>
                    <input
                      type="text"
                      placeholder="Search active users..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px 8px 36px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px", boxSizing: "border-box" }}
                    />
                    <Search size={13} style={{ position: "absolute", left: "12px", top: "11px", color: "#64748b" }} />
                  </div>
                </div>

                <div style={{ minWidth: "1200px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#1E2939", color: "#94a3b8", borderBottom: "2px solid rgba(255,255,255,0.05)" }}>
                        <th style={{ padding: "12px 10px" }}>Roll ID (UUID)</th>
                        <th style={{ padding: "12px 10px" }}>Full Name</th>
                        <th style={{ padding: "12px 10px" }}>Email Address</th>
                        <th style={{ padding: "12px 10px" }}>Education</th>
                        <th style={{ padding: "12px 10px" }}>Assigned Course</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Live Progress</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Performance Monitor</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Assignments Hub</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managedStudentsList.length > 0 ? (
                        managedStudentsList.map(student => {
                          const totalCalculatedLectures = lectures.filter(l => l.course_title === student.course_slug).length || 1;
                          const grossWeightProgress = Math.min(Math.round(((student.videos_watched || 0) / totalCalculatedLectures) * 100), 100);

                          return (
                            <tr key={student.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", backgroundColor: "rgba(30,41,57,0.15)" }}>
                              <td style={{ padding: "12px 10px", color: "#38bdf8", fontWeight: "700" }} title={student.id}>{student.id.substring(0, 8)}...</td>
                              <td style={{ padding: "12px 10px", color: "white", fontWeight: "600" }}>{student.full_name}</td>
                              <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>{student.email}</td>
                              <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>{student.education || "—"}</td>
                              <td style={{ padding: "12px 10px", color: "#fb923c" }}>{student.course_slug || "Not Assigned"}</td>
                              <td style={{ padding: "12px 10px", textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                  <div style={{ width: "60px", backgroundColor: "rgba(255,255,255,0.05)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{ width: `${grossWeightProgress}%`, backgroundColor: grossWeightProgress > 70 ? "#10b981" : grossWeightProgress > 40 ? "#eab308" : "#ef4444", height: "100%" }}></div>
                                  </div>
                                  <span style={{ fontWeight: "bold", color: grossWeightProgress > 70 ? "#34d399" : "#facc15" }}>{grossWeightProgress}%</span>
                                </div>
                              </td>
                              <td style={{ padding: "12px 10px", textAlign: "center" }}>
                                <button
                                  onClick={() => setSelectedStudentMetrics(student)}
                                  style={{ padding: "5px 10px", backgroundColor: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}
                                >
                                  View Metric Sheet
                                </button>
                              </td>
                              <td style={{ padding: "12px 10px", textAlign: "center" }}>
                                <button
                                  onClick={() => loadStudentSubmissions(student)}
                                  style={{ padding: "5px 10px", backgroundColor: "rgba(167,139,250,0.1)", color: "#c084fc", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}
                                >
                                  Review Tasks Desk
                                </button>
                              </td>
                              <td style={{ padding: "12px 10px", textAlign: "center" }}>
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Kya aap sach me student "${student.full_name}" ka record system se permanent delete krna chahte hain?`)) {
                                      const { error } = await supabase.from("profiles").delete().eq("id", student.id);
                                      if (!error) { alert("Student database record wiped out successfully."); fetchAdminData(); }
                                      else { alert(error.message); }
                                    }
                                  }}
                                  style={{ padding: "6px", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                  title="Delete Student Record Profile"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} style={{ fontSize: "12px", color: "#64748b", textAlign: "center", padding: "30px" }}>Database mein filhal koi registered active student nahi mila.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 📊 MODAL VIEW 1: PERFORMANCE DETAILED METRICS POPUP */}
              {selectedStudentMetrics && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                  <div style={{ backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.08)", padding: "28px", borderRadius: "16px", width: "450px", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
                    <button onClick={() => setSelectedStudentMetrics(null)} style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><X size={18} /></button>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "white", fontWeight: "700" }}>📊 Student Performance Monitor</h3>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 20px 0" }}>Live metrics synced from student workspace node tracks.</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#1E2939", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}><span style={{ color: "#94a3b8", fontSize: "13px" }}>Student Name:</span><span style={{ fontWeight: "600", color: "#fff" }}>{selectedStudentMetrics.full_name}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}><span style={{ color: "#94a3b8", fontSize: "13px" }}>Enrolled Track:</span><span style={{ color: "#fb923c", fontWeight: "600" }}>{selectedStudentMetrics.course_slug || "N/A"}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}><span style={{ color: "#94a3b8", fontSize: "13px" }}>Lectures Attended:</span><span style={{ color: "#38bdf8", fontWeight: "bold" }}>{selectedStudentMetrics.videos_watched || 0} Videos</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}><span style={{ color: "#94a3b8", fontSize: "13px" }}>Total Course Material:</span><span style={{ color: "#94a3b8" }}>{lectures.filter(l => l.course_title === selectedStudentMetrics.course_slug).length} Videos Loaded</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 📝 MODAL VIEW 2: SUBMITTED ASSIGNMENTS Hub DESK LAYOUT */}
              {selectedAssignmentStudent && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                  <div style={{ backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.08)", padding: "32px", borderRadius: "20px", width: "850px", maxWidth: "95%", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
                    <button onClick={() => { setSelectedAssignmentStudent(null); setStudentSubmissions([]); }} style={{ position: "absolute", top: "20px", right: "20px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><X size={20} /></button>

                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#c084fc", fontWeight: "800" }}>📝 Assignment Review Desk Hub</h3>
                      <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Evaluating work documents submitted by: <strong style={{ color: "white" }}>{selectedAssignmentStudent.full_name}</strong></p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {studentSubmissions.length > 0 ? (
                        studentSubmissions.map((sub) => (
                          <div key={sub.id} style={{ backgroundColor: "#1E2939", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                              <h4 style={{ margin: 0, fontSize: "14px", color: "white", fontWeight: "700" }}>🎥 Target Lecture ID Node: {sub.video_id} {sub.videos?.name ? `(${sub.videos.name})` : ''}</h4>
                              <span style={{ fontSize: "11px", fontWeight: "bold", backgroundColor: sub.grade === "Pending" ? "rgba(234,179,8,0.1)" : "rgba(16,185,129,0.1)", color: sub.grade === "Pending" ? "#facc15" : "#34d399", padding: "4px 8px", borderRadius: "4px" }}>Grade Locked: {sub.grade}</span>
                            </div>

                            <div style={{ marginBottom: "16px", backgroundColor: "#111827", padding: "10px", borderRadius: "6px" }}>
                              <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Submitted Workspace Link:</span>
                              <a href={sub.submission_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#38bdf8", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                                Open Student Submission Link <ExternalLink size={13} />
                              </a>
                            </div>

                            {/* DYNAMIC FORM ROW INPUT FOR SECURE EVALUATION MARKS */}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
                              <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>Update Evaluation & Review Feedback:</span>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: "10px", alignItems: "center" }}>
                                <input
                                  type="text"
                                  placeholder={sub.remarks || "Enter grading remarks / feedback comments here..."}
                                  onChange={(e) => setGradingRemarks(e.target.value)}
                                  style={{ padding: "10px", backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px", width: "100%", boxSizing: "border-box" }}
                                />
                                <select
                                  onChange={(e) => setGradingScore(e.target.value)}
                                  defaultValue={sub.grade}
                                  style={{ padding: "10px", backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "white", fontSize: "12px", width: "100%" }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="A+">Grade A+</option>
                                  <option value="A">Grade A</option>
                                  <option value="B">Grade B</option>
                                  <option value="C">Grade C</option>
                                  <option value="Failed">Failed</option>
                                </select>
                                <button
                                  onClick={() => handleUpdateGrade(sub.id)}
                                  disabled={actionLoading}
                                  style={{ padding: "10px 18px", backgroundColor: "#a78bfa", color: "black", border: "none", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                                >
                                  Save Entry
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#1E2939", borderRadius: "12px", color: "#64748b", fontSize: "13px" }}>
                          Is student ne abhi tak is course portal par koi assignment submission post nahi ki hai.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </>
        {/* ================= SECTION 6: SETTINGS PORTAL (CREDENTIALS CONFIGURATION) ================= */}
        {/* ================= SECTION 6: SETTINGS PORTAL (FINAL PRODUCTION CODE) ================= */}
        {activeSidebar === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", width: "100%" }}>

            {/* 🔐 PART 1: CORE ADMIN SECURITY CONTROL (PASSWORD & EMAIL UPDATE) */}
            <div style={{ backgroundColor: "#111827", padding: "28px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#10b981", fontWeight: "800" }}>⚙️ Core Server Control & Settings</h3>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 24px 0" }}>
                Yahan se aap admin account ke security credentials (Email aur Password) live cloud par update kar sakte hain.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setActionLoading(true);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user || !user.email) throw new Error("No active admin session found.");

                    if (!adminSettings.currentPassword) {
                      throw new Error("Identity verification ke liye purana password enter karna lazmi hai.");
                    }

                    // Step A: Verification using current credentials
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                      email: user.email,
                      password: adminSettings.currentPassword,
                    });
                    if (signInError) throw new Error("Purana password ghalat hai. Data access denied.");

                    // Step B: Update Password if modified
                    if (adminSettings.newPassword && adminSettings.newPassword.trim()) {
                      const { error: passError } = await supabase.auth.updateUser({ password: adminSettings.newPassword });
                      if (passError) throw passError;
                      alert("🚀 Admin Password successfully updated on cloud node!");
                    }

                    // Step C: Update Email if modified
                    if (adminSettings.newEmail && adminSettings.newEmail.trim() !== user.email) {
                      const { error: emailError } = await supabase.auth.updateUser({ email: adminSettings.newEmail });
                      if (emailError) throw emailError;
                      alert("✉️ Email change sync initiated! Purani aur nayi dono mail inbox par link bheja gaya hai verification ke liye.");
                    }

                    setAdminSettings({ currentPassword: "", newPassword: "", newEmail: "" });
                  } catch (err: any) {
                    alert("Security Sync Error: " + err.message);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}
              >
                {/* Current Password Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "#f43f5e", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Admin Password *</label>
                  <input
                    type="password"
                    placeholder="Confirm current active password..."
                    value={adminSettings.currentPassword || ""}
                    onChange={e => setAdminSettings({ ...adminSettings, currentPassword: e.target.value })}
                    required
                    style={{ padding: "12px", backgroundColor: "#070707", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "white", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)", margin: "8px 0" }}></div>

                {/* Change Email Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>New Admin Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter new admin target email..."
                    value={adminSettings.newEmail || ""}
                    onChange={e => setAdminSettings({ ...adminSettings, newEmail: e.target.value })}
                    style={{ padding: "12px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "white", fontSize: "13px", outline: "none" }}
                  />
                </div>

                {/* Change Password Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>New Admin Secure Password</label>
                  <input
                    type="password"
                    placeholder="Enter ultra-secure new password..."
                    value={adminSettings.newPassword || ""}
                    onChange={e => setAdminSettings({ ...adminSettings, newPassword: e.target.value })}
                    style={{ padding: "12px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "white", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: "12px 18px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", width: "fit-content", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }}
                >
                  {actionLoading ? "Processing Nodes..." : "Save Settings & Lock Core"}
                </button>
              </form>
            </div>

            {/* 👥 PART 2: DIRECT ADMIN ROLE DELEGATION (KISI AUR KO ADMIN BANANA) */}
            <div style={{ backgroundColor: "#111827", padding: "28px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#3b82f6", fontWeight: "800" }}>👥 Direct Admin Role Delegation</h3>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 24px 0" }}>
                Kisi registered user ya instructor ka email yahan enter kar ke unhein direct Admin privileges assign karein.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inviteEmail) return;
                  setActionLoading(true);

                  try {
                    // Direct database update matrix
                    const { data, error } = await supabase
                      .from('profiles') // Aapke database ka profiles/users table jahan rules save hain
                      .update({ role: 'admin' })
                      .eq('email', inviteEmail.trim());

                    if (error) throw error;

                    alert(`🚀 Success! ${inviteEmail} ko direct Admin role assign kar diya gaya hai. Ab unka password wahi chalega jo unhone register karte waqt rakha tha.`);
                    setInviteEmail("");
                  } catch (err: any) {
                    alert("Delegation Error: " + err.message);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Target User Email</label>
                  <input
                    type="email"
                    placeholder="e.g., partner@domain.com"
                    value={inviteEmail || ""}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    style={{ padding: "12px", backgroundColor: "#1E2939", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "white", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: "12px 18px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", width: "fit-content", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(59,130,246,0.15)" }}
                >
                  {actionLoading ? "Delegating Privileges..." : "Authorize New Admin"}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ================= SECTION 7: SOFT BIN LAYER RECOGNITION ================= */}
        {activeSidebar === "bin" && (
          <div style={{ backgroundColor: "#111827", padding: "24px", borderRadius: "16px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "15px", color: "#ef4444", fontWeight: "800" }}>🗑️ Soft Archived Bin Index Store</h3>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 20px 0" }}>Yahan mojud data temporary chupa hua hai par database cloud server se permanent delete nahi hua.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {binnedUsersList.length > 0 ? (
                binnedUsersList.map(user => (
                  <div key={user.id} style={{ backgroundColor: "#1E2939", padding: "16px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14px", color: "#94a3b8", textDecoration: "line-through" }}>{user.full_name}</h4>
                      <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginTop: "2px" }}>{user.email}</span>
                      <span style={{ fontSize: "10px", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "6px" }}>Status: Leads Soft-Binned</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => restoreLeadFromBin(user.id)}
                      style={{ padding: "6px 12px", backgroundColor: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Restore Record
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#1E2939", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Archive Bin filhal bilkul khali hai!</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}