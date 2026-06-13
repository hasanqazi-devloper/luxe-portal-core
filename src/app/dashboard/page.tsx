"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Award, BookOpen, ArrowRight, Loader2, CheckCircle, ShieldAlert, FolderDown, Lock, LogOut, Sparkles, Send, Video, Link, MessageSquare, Download, Wrench, FileText, ExternalLink, RefreshCw } from "lucide-react";

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
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [student, setStudent] = useState({ id: "", name: "Premium Student", email: "", feeStatus: "Unpaid" });
  const [enrollment, setEnrollment] = useState<EnrolledCourse | null>(null);

  // Dynamic States (No Dummy Data)
  const [assignmentUrl, setAssignmentUrl] = useState("");
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionMessage[]>([]);
  const [assets, setAssets] = useState<SharedAsset[]>([]);
  const [questionText, setQuestionText] = useState("");

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Profile Fetching
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, fee_status")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        setStudent({ 
          id: profile.id,
          email: profile.email || "",
          name: profile.full_name || "Premium Student", 
          feeStatus: profile.fee_status || "Unpaid" 
        });
      }

      if (profile && profile.fee_status === "Paid") {
        // 2. Course Allocation Engine
        const { data: enrollData, error: enrollError } = await supabase
          .from("enrollments")
          .select(`
            progress, 
            course_id, 
            courses (id, title, mentor, duration, lessons)
          `)
          .eq("student_id", user.id)
          .maybeSingle();

        if (enrollError) throw enrollError;
        if (enrollData) setEnrollment(enrollData as any);

        const targetCourseId = enrollData?.course_id;

        if (targetCourseId) {
          // 3. Dynamic Assignment Status Fetch
          const { data: assignData } = await supabase
            .from("assignments")
            .select("assignment_url, status, remarks, grade")
            .eq("student_id", user.id)
            .eq("course_id", targetCourseId)
            .maybeSingle();
          
          if (assignData) setSubmission(assignData);

          // 4. Dynamic Live Video Discussion Threads
          const { data: discussData } = await supabase
            .from("discussions")
            .select("id, student_name, message_text, reply_text, created_at")
            .eq("course_id", targetCourseId)
            .order("created_at", { ascending: false });
          
          if (discussData) setDiscussions(discussData);

          // 5. Dynamic Premium Materials & Themes Vault
          const { data: assetData } = await supabase
            .from("vault_assets")
            .select("id, asset_title, asset_type, download_url")
            .eq("course_id", targetCourseId);
          
          if (assetData) setAssets(assetData);
        }
      }
    } catch (error) {
      console.error("High Rise Grid Engine Sync Deviation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  // Real-time Database Assignment Push
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentUrl.trim() || !enrollment) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from("assignments").upsert({
        student_id: student.id,
        course_id: enrollment.course_id,
        assignment_url: assignmentUrl,
        status: "Submitted",
        remarks: "Awaiting review from Sir Abdul Basit...",
        grade: "Pending"
      });

      if (error) throw error;

      setSubmission({
        assignment_url: assignmentUrl,
        status: "Submitted",
        remarks: "Awaiting review from Sir Abdul Basit...",
        grade: "Pending"
      });
      alert("Task sheet dispatched directly to Sir Abdul Basit's auditing pane!");
    } catch (err) {
      console.error(err);
      alert("Submission Sync Failed. Verify database tables mapping.");
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time Q&A Discussion Broadcast
  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !enrollment) return;

    try {
      const { data: newMessage, error } = await supabase.from("discussions").insert({
        course_id: enrollment.course_id,
        student_id: student.id,
        student_name: student.name,
        message_text: questionText
      }).select().single();

      if (error) throw error;

      if (newMessage) {
        setDiscussions([newMessage, ...discussions]);
      }
      setQuestionText("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#060608", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", gap: "16px" }}>
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <span style={{ fontSize: "14px", color: "#a1a1aa", fontFamily: "monospace", letterSpacing: "1px" }}>INITIALIZING HIGH_RISE_DIGITAL_MATRIX...</span>
      </div>
    );
  }

  const hasValidCourse = enrollment && enrollment.courses;
  const courseTitle = enrollment?.courses?.title || "Assigned Masterclass Blueprint";
  const courseMentor = enrollment?.courses?.mentor || "Senior HRD Instructor";
  const courseDuration = enrollment?.courses?.duration || "Premium Track";
  const courseLessons = enrollment?.courses?.lessons || 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#070709", color: "#f4f4f5", padding: "32px", fontFamily: "system-ui, -apple-system, sans-serif", boxSizing: "border-box" }}>
      
      {/* 🚀 GLOWING HEADER NAVIGATION CONTROL */}
      <header style={{ maxWidth: "1440px", margin: "0 auto 32px auto", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(17,17,21,0.75)", backdropFilter: "blur(12px)", padding: "20px 32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 950, fontSize: "19px", color: "#ffffff", letterSpacing: "-0.5px" }}>
          <div style={{ padding: "8px", borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={20}/>
          </div>
          HIGH RISE DIGITAL <span style={{ color: "#3b82f6", fontWeight: 500, fontSize: "14px" }}>STUDENT AREA</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button onClick={fetchDashboardData} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", display: "flex", alignItems: "center" }} title="Sync Workspace State">
            <RefreshCw size={16} className="hover:text-white transition-colors" />
          </button>
          <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", backgroundColor: student.feeStatus === "Paid" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", color: student.feeStatus === "Paid" ? "#34d399" : "#f43f5e", padding: "8px 16px", borderRadius: "12px", fontWeight: "bold", border: `1px solid ${student.feeStatus === "Paid" ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}` }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: student.feeStatus === "Paid" ? "#34d399" : "#f43f5e" }}></span>
            {student.feeStatus === "Paid" ? "GATEWAY_AUTHORIZED" : "ACCESS_RESTRICTED"}
          </span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", borderRadius: "12px", color: "#e4e4e7", cursor: "pointer", fontSize: "13px", fontWeight: "bold", transition: "all 0.2s" }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1440px", margin: "0 auto" }}>
        
        {/* 🔥 CYBERPUNK STYLE INSTANT WELCOME NOTE */}
        <div style={{ background: "linear-gradient(135deg, #0e0f12 0%, #12131a 100%)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(59, 130, 246, 0.25)", position: "relative", overflow: "hidden", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", boxShadow: "0 15px 35px rgba(0,0,0,0.4)" }}>
          <div style={{ zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Sparkles size={20} style={{ color: "#3b82f6" }} />
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>Welcome back, {student.name}!</h2>
            </div>
            <p style={{ margin: "8px 0 0 0", color: "#a1a1aa", fontSize: "14px", maxWidth: "700px", lineHeight: "1.6" }}>
              High Rise Digital dynamic workspace initialized. Stream your target lectures, download proprietary frameworks, assets, and monitor real-time auditing pipelines.
            </p>
          </div>
          <div style={{ textAlign: "right", zIndex: 2, backgroundColor: "rgba(255,255,255,0.02)", padding: "12px 20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ display: "block", fontSize: "11px", color: "#71717a", fontWeight: "bold" }}>SYSTEM_NODE</span>
            <span style={{ display: "block", fontSize: "15px", fontWeight: "bold", color: "#3b82f6", marginTop: "2px" }}>Live Engine Active</span>
          </div>
        </div>

        {/* CONDITIONAL ROUTER GATEWAY */}
        {student.feeStatus === "Paid" && hasValidCourse ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: "32px", alignItems: "start" }}>
            
            {/* ==================== LEFT COMPONENT BLOCK ==================== */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* 📺 HIGH RISE PREMIUM CINEMA SCREEN */}
              <div style={{ backgroundColor: "#111114", padding: "28px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.04)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#3b82f6", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>NOW STREAMING LECTURE</div>
                    <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.3px" }}>{courseTitle}</h3>
                  </div>
                  <span style={{ fontSize: "12px", color: "#a1a1aa", backgroundColor: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: "8px" }}>Instructor: <b>{courseMentor}</b></span>
                </div>

                {/* Main Dynamic Video Sandbox */}
                <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#020203", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.03)", position: "relative", background: "radial-gradient(circle, #0e0f14 0%, #020204 100%)" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", marginBottom: "16px", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <Video size={28} />
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#e4e4e7", fontWeight: "bold" }}>Secure Video Stream Gateway</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#71717a" }}>All actions logged for verification audit parameters.</p>
                  
                  <button 
                    onClick={() => router.push(`/dashboard/course/${enrollment.course_id}`)}
                    style={{ position: "absolute", bottom: "24px", right: "24px", padding: "12px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 20px rgba(59,130,246,0.3)" }}
                  >
                    Launch Full Syllabus Interface <ArrowRight size={15} />
                  </button>
                </div>

                {/* Progress bar state engine */}
                <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "16px", backgroundColor: "rgba(255,255,255,0.02)", padding: "14px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "12px", color: "#71717a", fontWeight: "bold", minWidth: "100px" }}>COURSE PROGRESS</span>
                  <div style={{ flex: 1, height: "6px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                    <div style={{ width: `${enrollment.progress}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: "100px" }}></div>
                  </div>
                  <span style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "900" }}>{enrollment.progress}% Completed</span>
                </div>
              </div>

              {/* 💬 DYNAMIC LECTURE DISCUSSION ROOM */}
              <div style={{ backgroundColor: "#111114", padding: "28px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <MessageSquare size={18} style={{ color: "#3b82f6" }} />
                  <h4 style={{ fontSize: "16px", fontWeight: 900, color: "#ffffff", margin: 0 }}>LIVE CLASS DISCUSSION ROOM</h4>
                </div>

                <form onSubmit={handlePostQuestion} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  <input 
                    type="text" 
                    required
                    placeholder="Type runtime compilation queries or structural logical bottlenecks here..." 
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    style={{ flex: 1, padding: "14px 18px", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "white", fontSize: "13px" }}
                  />
                  <button type="submit" style={{ padding: "0 24px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Send size={15} />
                  </button>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "350px", overflowY: "auto", paddingRight: "4px" }}>
                  {discussions.length > 0 ? (
                    discussions.map(msg => (
                      <div key={msg.id} style={{ backgroundColor: "#16161a", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", color: "#60a5fa", fontWeight: "bold" }}>{msg.student_name}</span>
                          <span style={{ fontSize: "10px", color: "#52525b" }}>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "#e4e4e7", lineHeight: "1.5" }}>{msg.message_text}</p>
                        
                        {msg.reply_text && (
                          <div style={{ marginTop: "12px", padding: "12px 16px", backgroundColor: "#0c0d12", borderRadius: "10px", fontSize: "12.5px", color: "#a1a1aa", borderLeft: "3px solid #10b981", lineHeight: "1.5" }}>
                            <span style={{ display: "block", fontSize: "11px", color: "#10b981", fontWeight: "bold", marginBottom: "4px" }}>MENTOR RESPONSE VERIFIED:</span>
                            {msg.reply_text}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "30px", textTransform: "uppercase", textAlign: "center", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "16px", color: "#71717a", fontSize: "12px", letterSpacing: "0.5px" }}>
                      No discussions initialized yet on this video node. Be the first to ask!
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ==================== RIGHT COMPONENT BLOCK ==================== */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* 📦 DIGITAL PREMIUM MATERIAL & ASSET VAULT */}
              <div style={{ backgroundColor: "#111114", padding: "28px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.04)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 900, color: "#10b981", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Download size={18}/> PROPAGATED ASSETS & TOOLS VAULT</h4>
                  <p style={{ margin: "4px 0 0 0", color: "#71717a", fontSize: "12px", lineHeight: "1.4" }}>Download verified code bundles, themes, and blueprints provided directly by the management desk.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {assets.length > 0 ? (
                    assets.map(asset => (
                      <div key={asset.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#16161a", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ padding: "8px", backgroundColor: "rgba(16,185,129,0.06)", borderRadius: "10px", color: "#10b981" }}>
                            {asset.asset_type.toLowerCase().includes("theme") ? <FolderDown size={16}/> : asset.asset_type.toLowerCase().includes("tool") ? <Wrench size={16}/> : <FileText size={16}/>}
                          </div>
                          <div>
                            <h6 style={{ margin: 0, fontSize: "13px", color: "#ffffff", fontWeight: "bold" }}>{asset.asset_title}</h6>
                            <span style={{ fontSize: "11px", color: "#71717a" }}>Classification: {asset.asset_type}</span>
                          </div>
                        </div>
                        <a href={asset.download_url} target="_blank" rel="noreferrer" style={{ color: "#10b981", padding: "8px", backgroundColor: "rgba(16,185,129,0.05)", borderRadius: "10px", display: "flex", alignItems: "center" }}>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "24px", textTransform: "uppercase", textAlign: "center", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "14px", color: "#71717a", fontSize: "11px" }}>
                      No tools or templates assigned to this profile yet.
                    </div>
                  )}
                </div>
              </div>

              {/* 🚀 END-TO-END ASSIGNMENT HANDLING ENGINE */}
              <div style={{ backgroundColor: "#111114", padding: "28px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.04)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ marginBottom: "18px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 900, color: "#fb923c", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Link size={18}/> ASSIGNMENT EVALUATION CONSOLE</h4>
                  <p style={{ margin: "4px 0 0 0", color: "#71717a", fontSize: "12px", lineHeight: "1.4" }}>Paste your functional development link (GitHub / Drive Repository) to stream to Sir Abdul Basit's auditing desk.</p>
                </div>

                <form onSubmit={handleAssignmentSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  <input 
                    type="url"
                    required
                    placeholder="https://github.com/... or google drive code path" 
                    value={assignmentUrl}
                    onChange={(e) => setAssignmentUrl(e.target.value)}
                    style={{ padding: "14px", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "white", fontSize: "13px" }}
                  />
                  <button 
                    type="submit"
                    disabled={submitting}
                    style={{ padding: "14px", backgroundColor: "#fb923c", color: "#000000", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>}
                    Push Task Architecture Node
                  </button>
                </form>

                {/* REAL-TIME REMARKS FROM BACKEND EVALUATION TABLE */}
                <div style={{ backgroundColor: "#09090b", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", color: "#71717a", fontWeight: "bold" }}>REAL-TIME GRADE DISPATCH PANEL</span>
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(251,146,60,0.08)", color: "#fb923c", fontWeight: "bold" }}>
                      {submission ? submission.status.toUpperCase() : "AWAITING"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 75px", gap: "16px", alignItems: "center" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "10px", color: "#52525b", fontWeight: "bold" }}>SIR'S LIVE AUDIT REMARKS</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#e4e4e7", lineHeight: "1.4" }}>
                        {submission ? submission.remarks : "No solution detected in the active pipeline folder yet."}
                      </p>
                    </div>
                    <div style={{ textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "12px" }}>
                      <span style={{ display: "block", fontSize: "10px", color: "#52525b", fontWeight: "bold" }}>SCORE</span>
                      <span style={{ fontSize: "20px", fontWeight: "950", color: submission?.grade && submission.grade !== "Pending" ? "#34d399" : "#fb923c", display: "block", marginTop: "2px" }}>
                        {submission ? submission.grade : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* PENDING HOLD GATEWAY PROTECTOR */
          <div style={{ padding: "64px 40px", backgroundColor: "#111114", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center", maxWidth: "550px", margin: "60px auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "16px", backgroundColor: "rgba(234,88,12,0.08)", borderRadius: "50%", color: "#ea580c" }}>
              <Lock size={32} />
            </div>
            <div>
              <h3 style={{ color: "white", margin: 0, fontSize: "20px", fontWeight: 900, letterSpacing: "-0.3px" }}>Portal Syncing Suspended</h3>
              <p style={{ margin: "8px 0 0 0", fontSize: "13.5px", color: "#a1a1aa", lineHeight: "1.6" }}>
                Aapka profile core server data matrix mein linked hai. Lekin security clearance filter pass karne ke liye account setup verify hona lazmi hai. Verification audit complete hotay hi content streams authorize ho jayengi.
              </p>
            </div>
            <span style={{ color: "#fb923c", fontWeight: "bold", fontSize: "13px", letterSpacing: "0.5px" }}>Kindly coordinate with High Rise Digital Desk.</span>
          </div>
        )}

      </main>
    </div>
  );
}