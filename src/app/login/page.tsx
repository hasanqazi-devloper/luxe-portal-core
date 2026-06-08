"use client";
import React, { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { KeyRound, Mail, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (profileError || !profile) {
        setMessage({
          type: "error",
          text: "Aapka email registered nahi hai. Pehle WhatsApp par contact karke register karwayein.",
        });
        setLoading(false);
        return;
      }

      if (!profile.is_approved) {
        setMessage({
          type: "error",
          text: "Aapka account abhi tak Admin se approved nahi hua. Kindly wait karein ya WhatsApp support par batayein.",
        });
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) {
        setMessage({ type: "error", text: authError.message });
      } else {
        setMessage({
          type: "success",
          text: "Login link aapke email par bhej diya gaya hai! Apna Inbox check karein.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Kuch masla hua hai, dobara koshish karein." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#030303",
      color: "#a1a1aa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "rgba(255, 255, 255, 0.01)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        textAlign: "center",
        position: "relative"
      }}>
        
        {/* LOGO / HEADER */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#60a5fa",
            margin: "0 auto 16px auto"
          }}>
            <KeyRound size={22} />
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "#ffffff",
            margin: "0 0 4px 0",
            letterSpacing: "-0.5px",
            textTransform: "uppercase"
          }}>
            LMS Secure Portal
          </h1>
          <p style={{
            fontSize: "10px",
            color: "#52525b",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: 0,
            fontWeight: "bold"
          }}>
            HRD Institute Ecosystem
          </p>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {message && (
          <div style={{
            display: "flex",
            alignItems: "start",
            gap: "12px",
            padding: "16px",
            borderRadius: "12px",
            border: message.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
            backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.02)" : "rgba(239, 68, 68, 0.02)",
            color: message.type === "success" ? "#34d399" : "#f87171",
            fontSize: "12px",
            textAlign: "left",
            lineHeight: "1.5",
            marginBottom: "20px"
          }}>
            {message.type === "success" ? (
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : (
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            )}
            <p style={{ margin: 0 }}>{message.text}</p>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ textAlign: "left" }}>
            <label style={{
              fontSize: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#52525b",
              display: "block",
              marginBottom: "6px"
            }}>
              Registered Email Address
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#3f3f46",
                display: "flex",
                alignItems: "center"
              }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "14px 14px 14px 42px",
                  fontSize: "14px",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              color: "#0a0a0a",
              fontWeight: "bold",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.2s",
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? (
              <>
                Verifying Credentials <Loader2 size={14} className="animate-spin" />
              </>
            ) : (
              "Request Access Key"
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px" }}>
          <p style={{
            fontSize: "9px",
            color: "#3f3f46",
            letterSpacing: "1px",
            textTransform: "uppercase",
            margin: 0
          }}>
            Protected by SSL Tokenization
          </p>
        </div>
      </div>
    </main>
  );
}