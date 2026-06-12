import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; 

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HRD Institute | LMS Portal",
  description: "Premium Secure Learning Management System",
  icons: {
    icon: "/favicon.ico", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* 🎯 Next.js warning ko fixed karne ke liye data-scroll-behavior lagaya hai */
    <html 
      lang="en" 
      className="dark scroll-smooth" 
      data-scroll-behavior="smooth" 
      style={{ backgroundColor: "#070707", margin: 0, padding: 0 }}
    >
      {/* 🎯 Extension errors ko ignore karne ke liye suppressHydrationWarning lagaya hai */}
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning={true}
        style={{
          backgroundColor: "#070707",
          color: "#z300",
          minHeight: "100vh",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box"
        }}
      >
        {/* Main Application Wrapper जो sub-pages को full-width stretch होने से रोकेगा */}
        <div style={{ 
          width: "100%", 
          display: "flex", 
          flexDirection: "column", 
          flex: 1,
          boxSizing: "border-box"
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}