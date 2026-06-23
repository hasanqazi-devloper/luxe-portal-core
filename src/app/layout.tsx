import type { Metadata } from "next";
import "./globals.css"; 

export const metadata: Metadata = {
  title: "Luxe Portal | Premium Real Estate Matrix",
  description: "Executive Portal for High-Ticket Asset Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, backgroundColor: "#050505" }}>
      <body 
        suppressHydrationWarning={true} // 👈 Yeh magic attribute dharo yahan
        style={{ margin: 0, padding: 0, backgroundColor: "#050505", color: "#d4d4d8", fontFamily: "sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}