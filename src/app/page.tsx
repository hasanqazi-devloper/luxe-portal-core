"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
// 🛠️ FIX 1: Path ko exact universal standard par set kiya
import { supabase } from "@/src/lib/supabase"; 
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const evaluateSession = async () => {
      // 1. Current logged-in user ki details nikalen
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Agar user login nahi hai, to seedha login portal par bhejein
        router.push("/login");
      } else {
        // 2. Agar user mil gaya, to check karein admin hai ya student
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // 🛠️ FIX 2: Commented routes ko active kiya taake user auto-redirect ho sake
        if (profile && profile.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    };

    evaluateSession();
  }, [router]);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#030303", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", fontFamily: "sans-serif" }}>
      {/* Dynamic Authorization Loading Overlay */}
      <Loader2 className="animate-spin" style={{ color: "#3b82f6" }} size={36} />
      <p style={{ fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "2px", color: "#52525b" }}>
        Securing Core Session Nodes...
      </p>
    </main>
  );
}