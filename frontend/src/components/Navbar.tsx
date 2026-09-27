"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, clearSession, AuthSession } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";
import Logo from "@/components/Logo";
import { LayoutDashboard, Sliders, Award, Users, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: "en", label: "English", flag: "🇬🇧" });

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "ae", label: "العربية", flag: "🇦🇪" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#08090b]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center group shrink-0">
          <Logo size="md" />
        </Link>

        {/* Navigation links */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-neutral-300">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/certificates" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span>Rewards</span>
            <span className="text-[10px] font-black bg-[#ccff00] text-black px-1.5 py-0.5 rounded-full leading-none">
              New
            </span>
          </Link>
          <Link href="/challenges" className="hover:text-white transition-colors">
            Challenges
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/rules" className="hover:text-white transition-colors">
            Rules
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Language Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white rounded-lg hover:bg-white/[0.05] transition"
            >
              <span>{selectedLang.flag}</span>
              <span className="hidden md:inline">{selectedLang.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-[#111418] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setSelectedLang(l);
                      setLangOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-neutral-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {session ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/15 text-white transition border border-white/10"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#ccff00]" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/certificates"
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 transition"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Certificates</span>
              </Link>
              {session.isAdmin && (
                <Link
                  href="/admin/challenges"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="p-1.5 text-neutral-400 hover:text-red-400 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/login"
                className="text-xs font-bold text-neutral-300 hover:text-white transition-colors px-2 py-1.5"
              >
                Log in
              </Link>
              <Link
                href="/challenges"
                className="px-5 py-2 sm:py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs tracking-tight uppercase transition transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                Start now
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
