"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase"; 
import { Loader2, ShieldCheck } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const evaluateSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        // Profile se role check karein
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          router.push("/dashboard");
          return;
        }

        if (profile.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        router.push("/login");
      }
    };

    evaluateSession();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#070707", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <h3 style={{ letterSpacing: "2px", fontSize: "14px", textTransform: "uppercase" }}>Verifying Identity Node...</h3>
      </div>
    </div>
  );
}