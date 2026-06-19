"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Loader2, Lock, Mail, Award, Eye, EyeOff, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // States for password visible toggle
  const [showPassword, setShowPassword] = useState(false);

  // SIGN IN LOGIC
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#070707", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "400px", width: "100%", backgroundColor: "#111827", padding: "36px 32px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 900, fontSize: "20px", color: "#2563eb", marginBottom: "10px", letterSpacing: "0.5px" }}>
            <Award size={26} style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,0.4))" }}/> HRD INSTITUTE
          </div>
          <p style={{ color: "#71717a", fontSize: "13px", margin: 0, lineHeight: "18px" }}>Enter your credentials to sync secure container gateway.</p>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div style={{ backgroundColor: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", padding: "14px", borderRadius: "12px", fontSize: "13px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", lineHeight: "16px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span> {errorMsg}
          </div>
        )}

        {/* ---------------- HIGH-END COMPACT LOGIN FORM ---------------- */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Email Field Container */}
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#a1a1aa", marginBottom: "8px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
              <input 
                type="email" 
                placeholder="name@domain.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "#070707", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "white", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "all 0.2s ease" }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {/* Password Field Container */}
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#a1a1aa", marginBottom: "8px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
              
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: "100%", padding: "14px 48px 14px 44px", backgroundColor: "#070707", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "white", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "all 0.2s ease" }} 
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />

              {/* ✨ GLOW ANKH BUTTON (Interactive View/Hide Switch) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: showPassword ? "rgba(37,99,235,0.12)" : "transparent",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  color: showPassword ? "#3b82f6" : "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if(!showPassword) e.currentTarget.style.color = "#a1a1aa";
                }}
                onMouseLeave={(e) => {
                  if(!showPassword) e.currentTarget.style.color = "#6b7280";
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Core Submit Auth Action */}
          <button type="submit" disabled={loading} style={{ marginTop: "6px", backgroundColor: "#2563eb", color: "white", padding: "14px", border: "none", borderRadius: "14px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In to Portal"}
          </button>
        </form>

        {/* --- PREMIUM COMPACT ADMIN ASSISTANCE NOTIFICATION --- */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: "10px", backgroundColor: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.03)" }}>
          <HelpCircle size={16} style={{ color: "#64748b", flexShrink: 0, marginTop: "1px" }} />
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: "15px" }}>
            <strong style={{ color: "#9ca3af", display: "block", marginBottom: "2px" }}>Forgot your password?</strong>
            Please contact the HRD Institute administration desk or your instructor directly to request a manual secure credentials assignment.
          </p>
        </div>

      </div>
    </div>
  );
}