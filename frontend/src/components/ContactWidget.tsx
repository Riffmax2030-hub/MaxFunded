"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Headphones, X } from "lucide-react";

export default function ContactWidget() {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // If Crisp or Tawk.to or external live chat is loaded, open it directly
    if (typeof window !== "undefined") {
      const win = window as any;
      if (win.$crisp) {
        e.preventDefault();
        win.$crisp.push(["do", "chat:open"]);
        return;
      }
      if (win.Tawk_API && typeof win.Tawk_API.maximize === "function") {
        e.preventDefault();
        win.Tawk_API.maximize();
        return;
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip on hover */}
      {hovered && (
        <div className="hidden sm:flex items-center gap-2 bg-[#101318]/95 backdrop-blur-md border border-[#ccff00]/30 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>24/7 Live Support · Online</span>
        </div>
      )}

      {/* Modern Circular Floating Live Chat Launcher */}
      <Link
        href="/contact"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-14 h-14 rounded-full bg-[#0d0e12] border-2 border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95 group"
        aria-label="Open 24/7 Live Chat Support"
        title="Chat with Live Support"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />

        {/* Online Green Pulsing Beacon */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0d0e12]" />
        </span>
      </Link>
    </div>
  );
}
