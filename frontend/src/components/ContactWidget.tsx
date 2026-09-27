"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function ContactWidget() {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <Link
        href="/contact"
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold text-xs shadow-neon transition-all duration-200 transform hover:scale-105 active:scale-95 group"
      >
        <HelpCircle className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
        <span>Contact us</span>
      </Link>
    </div>
  );
}
