"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { ArrowLeft, Play, Video, BookOpen, Loader2, CheckCircle2, FileText, Download } from "lucide-react";

interface CourseData {
  title: string;
  mentor: string;
  progress: number;
}

interface VideoData {
  id: number;
  name: string;
  duration: string;
  video_url: string; // Database ka real string URL
  pdf_url?: string | null; // Optional notes dynamic mapping
  completed: boolean;
}

export default function CourseWatchSpace() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [playlist, setPlaylist] = useState<VideoData[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseAndVideos = async () => {
      setLoading(true);

      // 1. Fetch Course Meta Details
      const { data: courseData } = await supabase
        .from("courses")
        .select("title, mentor, progress")
        .eq("id", courseId)
        .maybeSingle();

      if (courseData) {
        setCourse(courseData as any);
      }

      // 2. Fetch Real-time Playlist Videos from Supabase
      const { data: videoData, error } = await supabase
        .from("videos")
        .select("id, name, duration, video_url, pdf_url, completed")
        .eq("course_id", courseId)
        .order("id", { ascending: true });

      if (!error && videoData && videoData.length > 0) {
        setPlaylist(videoData as any);
        setCurrentVideo(videoData[0] as any); // Pehli video default active set hogi
      } else {
        // Fallback agar back-end table empty mile
        const fallback: VideoData[] = [{
          id: 0,
          name: "No lectures deployed in this pipeline yet.",
          duration: "00:00",
          video_url: "",
          pdf_url: null,
          completed: false
        }];
        setPlaylist(fallback);
        setCurrentVideo(fallback[0]);
      }

      setLoading(false);
    };

    fetchCourseAndVideos();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#070707", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", gap: "12px" }}>
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span style={{ fontSize: "14px", color: "#a1a1aa", fontFamily: "sans-serif" }}>Synchronizing Secure Stream Core...</span>
      </div>
    );
  }

  // YouTube core dynamic transformation link detector helper
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return url.replace("youtu.be/", "www.youtube.com/embed/").replace("watch?v=", "embed/");
    }
    return url;
  };

  const isYouTube = currentVideo?.video_url?.includes("youtube.com") || currentVideo?.video_url?.includes("youtu.be");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0c", color: "#ffffff", padding: "24px", fontFamily: "sans-serif", boxSizing: "border-box" }}>

      {/* WATCH SPACE HEADER */}
      <div style={{ maxWidth: "1350px", margin: "0 auto 32px auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "white", cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>{course?.title}</h1>
            <p style={{ fontSize: "13px", color: "#71717a", margin: "4px 0 0 0" }}>Lead Mentor: <span style={{ color: "#ffffff", fontWeight: 500 }}>{course?.mentor}</span></p>
          </div>
        </div>
        <div style={{ fontSize: "13px", color: "#a1a1aa", backgroundColor: "#111115", padding: "8px 16px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.03)" }}>
          Pipeline Progress: <span style={{ color: "#3b82f6", fontWeight: "bold" }}>{course?.progress}%</span>
        </div>
      </div>

      {/* WATCH ROOM GRID LAYOUT */}
      <div style={{ maxWidth: "1350px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px", boxSizing: "border-box" }}>

        {/* LEFT COLUMN: PLAYER & DIGITAL RESOURCES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#000000", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            {currentVideo && currentVideo.video_url ? (
              isYouTube ? (
                /* 🎬 YOUTUBE AUTOMATIC EMBED CLASSROOM MATRIX */
                <iframe
                  src={getEmbedUrl(currentVideo.video_url)}
                  title={currentVideo.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                /* 🛡️ MP4 DIRECT NATIVE STORAGE SECURE PLAYER */
                <video
                  key={currentVideo.video_url}
                  src={currentVideo.video_url}
                  controls
                  controlsList="nodownload"
                  autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              )
            ) : (
              <div style={{ display: "flex", color: "#71717a", fontSize: "14px" }}>
                Select a workspace module from syllabus tree node.
              </div>
            )}
          </div>

          {/* LECTURE DESCRIPTION & METRIC BOARD */}
          <div style={{ backgroundColor: "#111115", padding: "28px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 800 }}>{currentVideo?.name}</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#71717a" }}>Duration: {currentVideo?.duration} Mins • Verified learning stream active.</p>

            {/* DYNAMIC COMPANION DOWNLOADABLE ASSIGNMENT NOTE */}
            {currentVideo?.pdf_url && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", padding: "16px 20px", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ backgroundColor: "rgba(16,185,129,0.1)", padding: "10px", borderRadius: "12px", color: "#10b981" }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 700 }}>Companion Handouts & Reference Docs</h5>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#71717a" }}>Official PDF materials compiled by Instructor</p>
                  </div>
                </div>
                <a
                  href={currentVideo.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#10b981", color: "#ffffff", fontSize: "13px", fontWeight: "bold", padding: "10px 16px", borderRadius: "10px", transition: "opacity 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                >
                  <Download size={14} /> Save Material
                </a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PREMIUM PLAYLIST SYLLABUS PANEL */}
        <div style={{ backgroundColor: "#111115", borderRadius: "24px", padding: "24px", border: "1px solid rgba(255,255,255,0.03)", height: "fit-content", maxHeight: "80vh", overflowY: "auto" }}>          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
          <BookOpen size={16} color="#3b82f6" />
          <h4 style={{ margin: 0, color: "#3b82f6", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Course Curriculum Pipeline</h4>
        </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {playlist.map((vid) => {
              const isSelected = vid.id === currentVideo?.id;
              return (
                <div
                  key={vid.id}
                  onClick={() => vid.id !== 0 && setCurrentVideo(vid)}
                  style={{
                    padding: "14px",
                    borderRadius: "16px",
                    backgroundColor: isSelected ? "rgba(59,130,246,0.08)" : "#18181c",
                    border: isSelected ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.01)",
                    cursor: vid.id === 0 ? "default" : "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", maxWidth: "80%" }}>
                    {vid.completed ? (
                      <CheckCircle2 size={15} style={{ color: "#10b981", flexShrink: 0 }} />
                    ) : (
                      <Video size={15} style={{ color: isSelected ? "#3b82f6" : "#71717a", flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "white" : "#a1a1aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {vid.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: isSelected ? "#3b82f6" : "#71717a", fontFamily: "monospace", fontWeight: "bold" }}>
                    {vid.duration}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}