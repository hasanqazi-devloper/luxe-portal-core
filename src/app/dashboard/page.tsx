"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import {
  Award, ArrowRight, Loader2, ShieldAlert,
  Lock, Send, Video, MessageSquare, Download, Wrench,
  FileText, ExternalLink, RefreshCw, Layers, User, Play, UploadCloud, ChevronDown, ClipboardList, History
} from "lucide-react";

interface EnrolledCourse {
  course_id: number;
  progress: number;
  courses: {
    id: number;
    title: string;
    mentor: string;
    duration: string;
    lessons: number;
  } | null;
}

interface AssignmentSubmission {
  id?: string;
  assignment_url: string;
  status: string;
  remarks: string;
  grade: string;
  video_id?: string | number;
  created_at?: string;
}

interface DiscussionMessage {
  id: string;
  student_name: string;
  message_text: string;
  reply_text: string | null;
  created_at: string;
}

interface SharedAsset {
  id: string;
  asset_title: string;
  asset_type: string;
  download_url: string;
  video_id?: string | number;
}

interface LectureVideo {
  id: number; // ✨ string ki jagah exact number rakhein kyunki aapka data id: 1, 3, 4 de raha hai
  name: string;
  duration: string;
  video_url: string | null;
  course_id?: number;
  completed?: boolean;
}
export default function StudentDashboard() {
  const router = useRouter();

  // 🧭 Navigation Tabs Manager
  const [activeTab, setActiveTab] = useState<"dashboard" | "classroom" | "tools" | "complain" | "account">("dashboard");

  // ⚡ Core Operation Control Engine States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [securityBreach, setSecurityBreach] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 👥 Authenticated Session State Nodes
  const [student, setStudent] = useState({ id: "", name: "Premium Student", email: "", feeStatus: "Paid", avatar: "" });
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);

  // 🎬 Classroom Stream Data Matrix
  const [lectures, setLectures] = useState<LectureVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<LectureVideo | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>("Syllabus Lessons & Lectures");
  const [modulesGrouped, setModulesGrouped] = useState<{ [key: string]: LectureVideo[] }>({});

  // 📝 Submissions & Real-Time Sync Storage Vaults
  const [assignmentUrl, setAssignmentUrl] = useState("");
  const [currentVideoSubmission, setCurrentVideoSubmission] = useState<AssignmentSubmission | null>(null);
  const [allSubmissionsHistory, setAllSubmissionsHistory] = useState<AssignmentSubmission[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionMessage[]>([]);
  const [assets, setAssets] = useState<SharedAsset[]>([]);

  // ✍️ Input Forms Model Buffers
  const [questionText, setQuestionText] = useState("");
  const [complainForm, setComplainForm] = useState({ subject: "", message: "" });
  const [accountForm, setAccountForm] = useState({ name: "", password: "", confirmPassword: "", avatarUrl: "" });

  // 🔒 Helper Engine to parse YouTube Native paths into sanitised embed streams
  const getEmbedUrl = (url: string | null) => {
    if (!url) return "";
    let cleanId = "";

    if (url.includes("youtu.be/")) {
      cleanId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
      cleanId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("embed/")) {
      return url;
    } else {
      return url;
    }

    return `https://www.youtube.com/embed/${cleanId}`;
  };

  // 🔒 HARDWARE GATEWAY SECURITY CONTROL PIPELINES
  useEffect(() => {
    const currentDeviceToken = localStorage.getItem("hrd_hardware_token");
    const localizedSignature = navigator.userAgent + "-" + navigator.hardwareConcurrency;

    if (!currentDeviceToken) {
      localStorage.setItem("hrd_hardware_token", btoa(localizedSignature));
    } else {
      if (atob(currentDeviceToken) !== localizedSignature) {
        setSecurityBreach(true);
        setSecurityMessage("🚨 Security System Active: Multiple device verification detected on this session profile.");
        return;
      }
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDownProtection = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDownProtection);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDownProtection);
    };
  }, []);

  // 🔄 Global Workspace Data Fetch Engine Loop
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      let currentFeeStatus = "Paid";
      let studentName = user.user_metadata?.full_name || "Premium Student";
      let avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && !profileError) {
          studentName = profile.full_name || profile.name || studentName;
          currentFeeStatus = profile.fee_status || profile.status || "Paid";
          avatarUrl = profile.avatar_url || profile.avatar || avatarUrl;
        }
      } catch (profileTableError) {
        console.log("Profiles synchronization fallback active.");
      }

      setStudent({
        id: user.id,
        email: user.email || "",
        name: studentName,
        feeStatus: currentFeeStatus,
        avatar: avatarUrl
      });

      if (!accountForm.name) {
        setAccountForm(prev => ({ ...prev, name: studentName, avatarUrl: avatarUrl }));
      }

      const { data: enrollData, error: enrollError } = await supabase
        .from("enrollments")
        .select("progress, course_id")
        .eq("student_id", user.id);

      if (enrollData && enrollData.length > 0) {
        const mappedEnrollments = await Promise.all(
          enrollData.map(async (item) => {
            const { data: courseData } = await supabase
              .from("courses")
              .select("id, title, mentor, duration, lessons")
              .eq("id", item.course_id)
              .maybeSingle();

            return {
              course_id: item.course_id,
              progress: item.progress || 0,
              courses: courseData || {
                id: item.course_id,
                title: "SEO + WordPress Premium Masterclass",
                mentor: "Sir Zain",
                duration: "8 Weeks",
                lessons: 24
              }
            };
          })
        );

        setEnrollments(mappedEnrollments);
        const activeTarget = selectedCourse || mappedEnrollments[0];
        if (!selectedCourse) setSelectedCourse(activeTarget);

        if (activeTarget) {
          // 3. Sync Classroom Videos (FIXED FOR YOUR SCHEME)
          const { data: videoData, error: videoError } = await supabase
            .from("videos")
            .select("id, name, duration, video_url, course_id")
            .eq("course_id", activeTarget.course_id)
            .order("id", { ascending: true });

          if (videoData && videoData.length > 0) {
            setLectures(videoData as LectureVideo[]);

            // Grouping manually under a custom track because your scheme doesn't have 'module_name'
            const grouped = {
              "Syllabus Lessons & Lectures": videoData as LectureVideo[]
            };
            setModulesGrouped(grouped);

            if (!activeVideo) {
              const firstValidVideo = videoData.find(v => v.video_url !== null) || videoData[0];
              setActiveVideo(firstValidVideo as LectureVideo);
            }
          }

          // 4. Global Submissions History Fetcher
          const { data: allAssigns } = await supabase
            .from("assignments")
            .select("assignment_url, status, remarks, grade, created_at, id, video_id")
            .eq("student_id", user.id)
            .eq("course_id", activeTarget.course_id);

          if (allAssigns) setAllSubmissionsHistory(allAssigns as AssignmentSubmission[]);

          // 5. Shared Assets Loading
          const { data: assetData } = await supabase
            .from("vault_assets")
            .select("id, asset_title, asset_type, download_url, video_id")
            .eq("course_id", activeTarget.course_id);

          if (assetData) setAssets(assetData);

          // 6. Chat Discussions Pipeline
          const { data: discussData } = await supabase
            .from("discussions")
            .select("id, student_name, message_text, reply_text, created_at")
            .eq("course_id", activeTarget.course_id)
            .order("created_at", { ascending: false });

          if (discussData) setDiscussions(discussData);
        }
      }
    } catch (error) {
      console.error("Main Synced Engine Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCourse?.course_id]);

  useEffect(() => {
    if (activeVideo && student.id && selectedCourse) {
      const match = allSubmissionsHistory.find(sub => String(sub.video_id) === String(activeVideo.id));
      setCurrentVideoSubmission(match || null);
    }
  }, [activeVideo, allSubmissionsHistory]);

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentUrl.trim() || !selectedCourse || !activeVideo) return;

    setSubmitting(true);
    try {
      const payload = {
        student_id: student.id,
        course_id: selectedCourse.course_id,
        video_id: activeVideo.id,
        assignment_url: assignmentUrl,
        status: "Submitted",
        remarks: "Awaiting manual auditing parameters verification...",
        grade: "Pending"
      };

      await supabase.from("assignments").upsert(payload);
      alert("Assignment successfully deployed!");
      setAssignmentUrl("");
      fetchDashboardData();
    } catch (err) {
      alert("Error submitting assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !selectedCourse) return;

    try {
      const { data: newMessage } = await supabase.from("discussions").insert({
        course_id: selectedCourse.course_id,
        student_id: student.id,
        student_name: student.name,
        message_text: questionText
      }).select().single();

      if (newMessage) setDiscussions([newMessage, ...discussions]);
      setQuestionText("");
    } catch (err) { }
  };

  const handleComplainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    alert(`Ticket Registered! Subject: ${complainForm.subject}.`);
    setComplainForm({ subject: "", message: "" });
    setSubmitting(false);
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from("profiles").update({
        full_name: accountForm.name,
        avatar_url: accountForm.avatarUrl
      }).eq("id", student.id);

      if (accountForm.password) {
        if (accountForm.password !== accountForm.confirmPassword) {
          alert("Passwords do not match!");
          setSubmitting(false);
          return;
        }
        await supabase.auth.updateUser({ password: accountForm.password });
      }

      alert("Profile modifications synced successfully!");
      fetchDashboardData();
    } catch (err) {
      alert("Error updating profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVideoNavigation = (direction: "prev" | "next") => {
    if (!activeVideo || lectures.length === 0) return;
    const currentIndex = lectures.findIndex(v => String(v.id) === String(activeVideo.id));
    if (direction === "next" && currentIndex < lectures.length - 1) {
      setActiveVideo(lectures[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      setActiveVideo(lectures[currentIndex - 1]);
    }
  };

  const currentVideoNotes = assets.filter(a => String(a.video_id) === String(activeVideo?.id));

  if (securityBreach) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
        <ShieldAlert size={64} style={{ color: "#ef4444", marginBottom: "16px" }} />
        <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: "bold" }}>Portal Authorization Blocked</h1>
        <p style={{ color: "#94a3b8", maxWidth: "500px", fontSize: "14px", marginTop: "8px" }}>{securityMessage}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>Syncing Workspace Core Environment...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1E2939", color: "#f8fafc", padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif", boxSizing: "border-box" }}>

      {/* Watermark */}
      <div style={{ position: "fixed", pointerEvents: "none", top: "15px", right: "15px", zIndex: 999, opacity: 0.15, fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}>
        ID: {student.id.slice(0, 8)}
      </div>

      {/* HEADER NAVBAR */}
      <header style={{ maxWidth: "1400px", margin: "0 auto 32px auto", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111827", padding: "16px 32px", borderRadius: "20px", border: "1px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "800", fontSize: "18px", color: "#ffffff" }}>
          <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#111827", color: "#ffffff", display: "flex", alignItems: "center" }}>
            <Award size={20} />
          </div>
          HIGH RISE DIGITAL
        </div>

        <nav style={{ display: "flex", gap: "6px", backgroundColor: "#111827", padding: "4px", borderRadius: "12px", border: "1px solid #334155" }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: <Layers size={14} /> },
            { id: "classroom", label: "Classroom Studio", icon: <Video size={14} /> },
            { id: "tools", label: "Tools Vault", icon: <Wrench size={14} /> },
            { id: "complain", label: "Complain Desk", icon: <MessageSquare size={14} /> },
            { id: "account", label: "My Profile", icon: <User size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", backgroundColor: activeTab === tab.id ? "#2563eb" : "transparent", color: activeTab === tab.id ? "#ffffff" : "#94a3b8" }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <button onClick={fetchDashboardData} style={{ background: "none", border: "none", color: "#f8fafd", cursor: "pointer" }} title="Re-Sync State">
            <RefreshCw size={16} />
          </button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ backgroundColor: "#ef4444", border: "none", padding: "10px 20px", borderRadius: "10px", color: "#ffffff", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ background: "#111827", borderRadius: "24px", padding: "32px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#ffffff" }}>Welcome Back, {student.name}!</h2>
                {/* <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>Click Launch Classroom below to watch video lectures or submit your tasks sheets.</p> */}
              </div>
            </div>

            <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#ebeef1", textTransform: "uppercase" }}>Your Enrolled Programs</h4>

            {enrollments.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
                {enrollments.map((item, index) => (
                  <div key={index} style={{ backgroundColor: "#111827", borderRadius: "20px", border: "1px solid #334155", overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)", padding: "24px", borderBottom: "1px solid #334155" }}>
                      <span style={{ fontSize: "10px", backgroundColor: "#312e81", color: "#6366f1", padding: "4px 8px", borderRadius: "6px", fontWeight: "800" }}>PREMIUM TRACK</span>
                      <h4 style={{ margin: "10px 0 0 0", color: "#ffffff", fontSize: "18px", fontWeight: "800" }}>{item.courses?.title}</h4>
                    </div>

                    <div style={{ padding: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#e9edf3", marginBottom: "20px" }}>
                        <span>Mentor: <b style={{ color: "#f8fafc" }}>{item.courses?.mentor}</b></span>
                        <span>Duration: {item.courses?.duration}</span>
                      </div>

                      <div style={{ margin: "0 0 24px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "#94a3b8" }}>
                          <span>COURSE PROGRESS</span>
                          <span style={{ color: "#eff4f7" }}>{item.progress}% Completed</span>
                        </div>
                        <div style={{ height: "6px", backgroundColor: "#0f172a", borderRadius: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${item.progress}%`, height: "100%", backgroundColor: "#2563eb" }}></div>
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedCourse(item); setActiveTab("classroom"); }}
                        style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px" }}
                      >
                        Launch Classroom Studio <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "48px", backgroundColor: "#0d3f8f", borderRadius: "24px", textAlign: "center", border: "2px dashed #334155" }}>
                <Lock size={32} style={{ color: "#64748b", marginBottom: "12px" }} />
                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No active program allocation detected.</p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: CLASSROOM CORE STUDIO ================= */}
        {activeTab === "classroom" && selectedCourse && (
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "32px", alignItems: "start" }}>

            {/* LEFT AREA: PLAYER AND STUFF */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Media Player Box */}
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "24px", border: "1px solid #334155" }}>
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "10px", color: "#38bdf8", fontWeight: "800", textTransform: "uppercase" }}>NOW PLAYING LECTURE</span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>
                    {activeVideo ? activeVideo.name : "Loading Video Sequence..."}
                  </h3>
                </div>

                <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#0f172a", borderRadius: "16px", overflow: "hidden", position: "relative", border: "1px solid #334155" }}>
                  {activeVideo?.video_url ? (
                    <div style={{ width: "100%", height: "100%" }}>
                      <iframe
                        src={`${getEmbedUrl(activeVideo.video_url)}?controls=1&modestbranding=1&rel=0`}
                        title="HRD Studio Player"
                        style={{ width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b" }}>
                      <Video size={40} style={{ marginBottom: "12px" }} />
                      <span style={{ fontSize: "13px" }}>No video URL linked in database for this specific row.</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <button onClick={() => handleVideoNavigation("prev")} style={{ padding: "10px 20px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", cursor: "pointer", fontSize: "13px", color: "#94a3b8" }}>
                    ← Previous Lecture
                  </button>
                  <button onClick={() => handleVideoNavigation("next")} style={{ padding: "10px 20px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", cursor: "pointer", fontSize: "13px", color: "#94a3b8" }}>
                    Next Lecture →
                  </button>
                </div>
              </div>

              {/* STUDY RESOURCE NOTES ATTACHMENTS */}
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "24px", border: "1px solid #334155" }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "800", color: "#10b981", display: "flex", alignItems: "center", gap: "8px" }}><FileText size={16} /> LECTURE ATTACHMENTS & STUDY NOTES</h4>
                <p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "12.5px" }}>Is video ke regarding links aur resources niche available hain:</p>

                {currentVideoNotes.length === 0 ? (
                  <span style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", display: "block", padding: "12px", backgroundColor: "#0f172a", borderRadius: "12px", textAlign: "center" }}>No resources linked with this video timeline.</span>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                    {currentVideoNotes.map(note => (
                      <div key={note.id} style={{ backgroundColor: "#0f172a", padding: "12px 16px", borderRadius: "12px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h5 style={{ margin: 0, fontSize: "13px", color: "#ffffff" }}>{note.asset_title}</h5>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{note.asset_type}</span>
                        </div>
                        <a href={note.download_url} target="_blank" rel="noreferrer" style={{ padding: "8px", backgroundColor: "#1e293b", borderRadius: "8px", color: "#10b981", border: "1px solid #334155" }}><Download size={14} /></a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TASK SHEET SUBMISSION MATRIX */}
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "24px", border: "1px solid #334155" }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "800", color: "#f97316", display: "flex", alignItems: "center", gap: "8px" }}><UploadCloud size={16} /> DEPLOY ASSIGNMENT / TASK SOLUTION LINK</h4>
                <p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "12.5px" }}>Active selected video lecture ka assignment link niche submit karein:</p>

                <form onSubmit={handleAssignmentSubmit} style={{ display: "flex", gap: "12px" }}>
                  <input type="url" required placeholder="Paste Drive link or GitHub repository tracking link..." value={assignmentUrl} onChange={e => setAssignmentUrl(e.target.value)} style={{ flex: 1, padding: "12px 16px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "13px", color: "#f8fafc" }} />
                  <button type="submit" disabled={submitting} style={{ padding: "0 24px", backgroundColor: "#f97316", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                    Submit Task
                  </button>
                </form>

                {currentVideoSubmission && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", backgroundColor: "#0f172a", padding: "16px", borderRadius: "14px", marginTop: "16px", border: "1px solid #334155", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#f97316", fontWeight: "800", display: "block" }}>INSTRUCTOR GRADING REMARKS:</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>{currentVideoSubmission.remarks}</p>
                    </div>
                    <div style={{ paddingLeft: "20px", borderLeft: "1px solid #334155", textAlign: "center" }}>
                      <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>GRADE</span>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#4ade80" }}>{currentVideoSubmission.grade}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* REALTIME CHAT SYSTEM */}
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "24px", border: "1px solid #334155" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "800", color: "#2563eb" }}>COMMUNITY BATCH DISCUSSIONS CORE</h4>
                <form onSubmit={handlePostQuestion} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                  <input type="text" required placeholder="Ask any problem or question related to this course..." value={questionText} onChange={e => setQuestionText(e.target.value)} style={{ flex: 1, padding: "12px 16px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "13px", color: "#f8fafc" }} />
                  <button type="submit" style={{ padding: "0 20px", backgroundColor: "#2563eb", border: "none", borderRadius: "12px", color: "#ffffff", cursor: "pointer" }}><Send size={15} /></button>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "220px", overflowY: "auto" }}>
                  {discussions.map(msg => (
                    <div key={msg.id} style={{ backgroundColor: "#0f172a", padding: "14px", borderRadius: "12px", border: "1px solid #334155", fontSize: "13px" }}>
                      <span style={{ color: "#38bdf8", fontWeight: "700", display: "block", fontSize: "11px", marginBottom: "4px" }}>{msg.student_name}</span>
                      <p style={{ margin: "2px 0 0 0", color: "#cbd5e1" }}>{msg.message_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: FIXED PLAYLIST TIMELINE WITHOUT MODULE_NAME */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <button
                onClick={() => setShowHistoryModal(true)}
                style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)", border: "1px solid #6d28d9", borderRadius: "16px", color: "#ffffff", fontWeight: "800", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                <ClipboardList size={18} /> View All Submitted Assignments
              </button>

              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "24px", border: "1px solid #334155" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "800", color: "#a855f7" }}>COURSE TIMELINE PLAYLIST</h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {Object.keys(modulesGrouped).map((modName, idx) => {
                    const isExpanded = expandedModule === modName;
                    return (
                      <div key={idx} style={{ border: "1px solid #334155", borderRadius: "14px", overflow: "hidden", backgroundColor: "#0f172a" }}>
                        <div
                          onClick={() => setExpandedModule(isExpanded ? null : modName)}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#1e293b", cursor: "pointer" }}
                        >
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>{modName}</span>
                          <ChevronDown size={16} style={{ color: "#94a3b8", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "all 0.2s" }} />
                        </div>

                        {isExpanded && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px", backgroundColor: "#0f172a" }}>
                            {modulesGrouped[modName].map(video => {
                              const isCurrent = String(activeVideo?.id) === String(video.id);
                              return (
                                <div
                                  key={video.id}
                                  onClick={() => setActiveVideo(video)}
                                  style={{ padding: "10px 12px", backgroundColor: isCurrent ? "rgba(168,85,247,0.15)" : "transparent", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", border: isCurrent ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent" }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, overflow: "hidden" }}>
                                    <Play size={12} style={{ color: isCurrent ? "#c084fc" : "#64748b", fill: isCurrent ? "#c084fc" : "none" }} />
                                    <span style={{ fontSize: "12.5px", color: isCurrent ? "#c084fc" : "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: isCurrent ? "700" : "500" }}>{video.name}</span>
                                  </div>
                                  <span style={{ fontSize: "11px", color: "#64748b", paddingLeft: "8px" }}>{video.duration}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: TOOLS CENTRAL VAULT ================= */}
        {activeTab === "tools" && (
          <div style={{ backgroundColor: "#111827", padding: "32px", borderRadius: "24px", border: "1px solid #334155" }}>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#13e9a1" }}>Central Tools & Softwares Download Center</h3>
              <p style={{ margin: "4px 0 0 0", color: "#e3eaf5", fontSize: "13.5px" }}>Download setup assets shared directly via admin portal.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {assets.map(asset => (
                <div key={asset.id} style={{ backgroundColor: "#111827", padding: "20px", borderRadius: "16px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgba(16,185,129,0.1)", borderRadius: "10px", color: "#10b981" }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: "700" }}>{asset.asset_title}</h5>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{asset.asset_type}</span>
                    </div>
                  </div>
                  <a href={asset.download_url} target="_blank" rel="noreferrer" style={{ padding: "10px", backgroundColor: "#1e293b", borderRadius: "10px", color: "#10b981", border: "1px solid #334155" }}><Download size={14} /></a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: COMPLAIN SYSTEM ================= */}
        {activeTab === "complain" && (
          <div style={{ backgroundColor: "#111827", padding: "32px", borderRadius: "24px", border: "1px solid #334155", maxWidth: "600px", margin: "0 auto" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#f04a4a", fontWeight: "800" }}>Support Ticket Complain Pipeline</h3>
            <p style={{ margin: "0 0 24px 0", color: "#f8f8f8", fontSize: "13.5px" }}>Register backend discrepancies or account login/fee related issues directly to admin panel track.</p>

            <form onSubmit={handleComplainSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={{ display: "block", fontSize: "12px", color: "#cbd5e1", fontWeight: "700", marginBottom: "6px" }}>COMPLAIN SUBJECT HEADER</span>
                <input type="text" required placeholder="e.g., Video portal taking latency loading errors..." value={complainForm.subject} onChange={e => setComplainForm({ ...complainForm, subject: e.target.value })} style={{ width: "100%", padding: "12px 16px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f8fafc", boxSizing: "border-box" }} />
              </div>
              <div>
                <span style={{ display: "block", fontSize: "12px", color: "#cbd5e1", fontWeight: "700", marginBottom: "6px" }}>DETAILED DESCRIPTION LOGGER</span>
                <textarea rows={5} required placeholder="Write details about the bug parameters..." value={complainForm.message} onChange={e => setComplainForm({ ...complainForm, message: e.target.value })} style={{ width: "100%", padding: "12px 16px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f8fafc", boxSizing: "border-box", resize: "none" }} />
              </div>
              <button type="submit" disabled={submitting} style={{ padding: "14px", backgroundColor: "#ef4444", border: "none", color: "#ffffff", fontWeight: "800", borderRadius: "12px", cursor: "pointer" }}>
                Submit Issue Ticket
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 5: ACCOUNT SETTINGS ================= */}
        {activeTab === "account" && (
          <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: "32px", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ backgroundColor: "#0c1829", padding: "32px", borderRadius: "24px", border: "1px solid #334155", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <img src={student.avatar} alt="Avatar" style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover", border: "4px solid #2563eb" }} />
              <h4 style={{ margin: "14px 0 4px 0", fontSize: "18px", color: "#ffffff", fontWeight: "800" }}>{student.name}</h4>
              <span style={{ fontSize: "13px", color: "#64748b" }}>{student.email}</span>
            </div>

            <div style={{ backgroundColor: "#081933", padding: "32px", borderRadius: "24px", border: "1px solid #334155" }}>
              <h4 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#ffffff", fontWeight: "800" }}>Update Workspace Account Profiles</h4>

              <form onSubmit={handleAccountUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>FULL NAME</span>
                  <input type="text" value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} style={{ width: "100%", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#f8fafc", boxSizing: "border-box" }} />
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>AVATAR IMAGE URL</span>
                  <input type="url" placeholder="Paste image public address url link..." value={accountForm.avatarUrl} onChange={e => setAccountForm({ ...accountForm, avatarUrl: e.target.value })} style={{ width: "100%", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#f8fafc", boxSizing: "border-box" }} />
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>NEW PASSWORD (OPTIONAL)</span>
                  <input type="password" placeholder="Leave blank to unchange fields..." value={accountForm.password} onChange={e => setAccountForm({ ...accountForm, password: e.target.value })} style={{ width: "100%", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#f8fafc", boxSizing: "border-box" }} />
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>CONFIRM PASSWORD</span>
                  <input type="password" placeholder="Re-type fields matching arrays..." value={accountForm.confirmPassword} onChange={e => setAccountForm({ ...accountForm, confirmPassword: e.target.value })} style={{ width: "100%", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#f8fafc", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={submitting} style={{ padding: "12px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                  Save Parameters Configuration
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ================= HISTORICAL ASSIGNMENT GRADES OVERLAY MODAL ================= */}
      {showHistoryModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", width: "90%", maxWidth: "800px", borderRadius: "24px", padding: "32px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #334155", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <History size={22} style={{ color: "#a855f7" }} />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>My Assignment Submissions Matrix Logs</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>Close</button>
            </div>

            {allSubmissionsHistory.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>You haven't submitted any assignments yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {allSubmissionsHistory.map((sub) => (
                  <div key={sub.id} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "16px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "10px", backgroundColor: "rgba(168,85,247,0.15)", color: "#c084fc", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(168,85,247,0.3)", fontWeight: "700" }}>SUBMITTED STATUS LAYER</span>
                        <a href={sub.assignment_url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#38bdf8", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>Open Link Node <ExternalLink size={10} /></a>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>REMARKS ASSESSMENT:</span>
                      <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>{sub.remarks}</p>
                    </div>
                    <div style={{ textAlign: "center", paddingLeft: "20px", borderLeft: "1px solid #334155", minWidth: "80px" }}>
                      <span style={{ fontSize: "9px", color: "#64748b", display: "block", fontWeight: "700" }}>GRADE RATING</span>
                      <span style={{ fontSize: "20px", fontWeight: "900", color: sub.grade === "Pending" ? "#f59e0b" : "#4ade80" }}>{sub.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}