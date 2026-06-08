import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Confirm karein ye file aapke project me majood ho

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HRD Institute | LMS Portal",
  description: "Premium Secure Learning Management System",
  icons: {
    icon: "/favicon.ico", // Agar public folder me icon.png rakhi hai to wo rasta yahan de dein
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} antialiased bg-[#030303] text-zinc-300 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}