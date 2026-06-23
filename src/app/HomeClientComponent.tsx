'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; // ✨ Clean relative import path integration
import { Loader2 } from "lucide-react";

export default function HomeClientComponent() {
  const router = useRouter();

  useEffect(() => {
    const evaluateSession = async () => {
      try {
        // 🔒 Check user status safely on browser side only
        const { data: { session } } = await supabase.auth.getSession();

        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        // 🚀 Logged-in user direct gateway
        router.push("/admin");

      } catch (err) {
        console.error("Auth routing engine crash:", err);
        router.push("/login");
      }
    };

    evaluateSession();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#050505", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
        <h3 style={{ letterSpacing: "3px", fontSize: "11px", textTransform: "uppercase", color: "#666" }}>
          Establishing Core Matrix Uplink...
        </h3>
      </div>
    </div>
  );
}