"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Loader2, Lock, Mail, Award } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Identity router check karne ke liye root node par bhejain
      router.push("/");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#070707", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "400px", width: "100%", backgroundColor: "#111827", padding: "32px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 900, fontSize: "18px", color: "#2563eb", marginBottom: "10px" }}>
            <Award size={24}/> HRD INSTITUTE
          </div>
          <p style={{ color: "#71717a", fontSize: "13px", margin: 0 }}>Enter your credentials to sync secure connection.</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", padding: "12px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#a1a1aa", marginBottom: "6px", textTransform: "uppercase", fontWeight: "bold" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
              <input type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "12px 12px 12px 40px", backgroundColor: "#070707", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", boxSizing: "border-box" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#a1a1aa", marginBottom: "6px", textTransform: "uppercase", fontWeight: "bold" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 12px 12px 40px", backgroundColor: "#070707", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", boxSizing: "border-box" }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: "10px", backgroundColor: "#2563eb", color: "white", padding: "14px", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In to Portal"}
          </button>
        </form>

      </div>
    </div>
  );
}