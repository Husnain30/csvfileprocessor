import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "CSVFORGE — Product Data Pipeline",
  description: "Upload, process, and analyze product CSV data at scale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <body className="bg-[#0a0a0a] text-[#e8e8e0] min-h-screen font-mono antialiased">
        {/* Grid overlay */}
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,180,0,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,180,0,0.03) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 border-b border-[#1e1e1e] bg-[#0a0a0a]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-7 h-7 bg-amber-400 flex items-center justify-center">
                <span className="text-black text-xs font-bold font-mono">CF</span>
              </div>
              <span className="font-syne font-800 text-sm tracking-[0.2em] uppercase text-white">
                CSV<span className="text-amber-400">FORGE</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-xs tracking-widest text-[#666] uppercase">
              <Link href="/" className="hover:text-amber-400 transition-colors">Upload</Link>
              <Link href="/files" className="hover:text-amber-400 transition-colors">Files</Link>
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          {children}
        </main>

        {/* Bottom border accent */}
        <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />
      </body>
    </html>
  );
}