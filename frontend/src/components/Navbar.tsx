"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession, clearSession, AuthSession } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Sliders,
  Award,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({
    code: "en-gb",
    label: "English",
    flag: "🇬🇧",
  });
  const pathname = usePathname();

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  const languages = [
    { code: "en-gb", label: "English (UK)", flag: "🇬🇧" },
    { code: "en-us", label: "English (US)", flag: "🇺🇸" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "ae", label: "العربية", flag: "🇦🇪" },
    { code: "ng", label: "Nigeria", flag: "🇳🇬" },
    { code: "jp", label: "日本語", flag: "🇯🇵" },
  ];

  const navLinks = [
    { href: "/", label: "Home" },
    {
      href: "/certificates",
      label: "Rewards",
      badge: "New",
    },
    { href: "/challenges", label: "Challenges" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/rules", label: "Rules" },
    { href: "/about", label: "About Us" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#08090b]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      {/* Spacious Full-Width Container to Pin Logo Far-Left and Actions Far-Right */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        
        {/* ========================================================================= */}
        {/* TOP LEFT CORNER: Max Funded Proprietary Firm Logo */}
        {/* ========================================================================= */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center group transition-transform hover:opacity-95">
            <Logo size="md" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* CENTER NAVIGATION: Enlarged Font Size matching Pivex (text-[15px]) */}
        {/* ========================================================================= */}
        <nav className="hidden lg:flex items-center space-x-7 xl:space-x-9">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 text-[15px] font-semibold tracking-tight transition-colors duration-200 py-1 ${
                  isActive
                    ? "text-[#ccff00] font-bold"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                <span>{link.label}</span>

                {/* Rewards "New" Pill Badge */}
                {link.badge && (
                  <span className="text-[10px] font-extrabold bg-[#ccff00] text-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(204,255,0,0.5)]">
                    {link.badge}
                  </span>
                )}

                {/* Subtle active line indicator */}
                {isActive && (
                  <span className="absolute bottom-[-6px] left-0 right-0 h-[2px] bg-[#ccff00] rounded-full shadow-[0_0_8px_#ccff00]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ========================================================================= */}
        {/* TOP RIGHT CORNER: Language Selector + Login + Start Now */}
        {/* ========================================================================= */}
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          
          {/* Language Selector with Visible Country Flags */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition shadow-sm"
              title="Select Language"
            >
              <span className="text-base sm:text-lg leading-none">{selectedLang.flag}</span>
              <span className="hidden sm:inline font-medium text-xs text-neutral-300">{selectedLang.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#101318]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-white/5">
                  Select Language
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setSelectedLang(l);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition ${
                        selectedLang.code === l.code
                          ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                          : "text-neutral-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      {selectedLang.code === l.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Session or Login / Start Now CTAs */}
          {session ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-full bg-[#ccff00]/15 hover:bg-[#ccff00]/25 text-[#ccff00] transition border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.15)]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#ccff00]" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/certificates"
                className="hidden md:flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 transition"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Certificates</span>
              </Link>
              {session.isAdmin && (
                <Link
                  href="/admin/challenges"
                  className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="p-2 text-neutral-400 hover:text-rose-400 transition rounded-xl hover:bg-white/5"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                href="/login"
                className="text-xs sm:text-[14px] font-bold text-neutral-200 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
              >
                Log in
              </Link>
              <Link
                href="/challenges"
                className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-black text-xs sm:text-[13px] tracking-tight uppercase transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
              >
                Start now
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-neutral-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER MENU */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0e10]/98 border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-base font-semibold text-neutral-200 hover:text-[#ccff00] transition"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-black bg-[#ccff00] text-black px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {!session ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-bold text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/challenges"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-white text-black font-extrabold text-sm uppercase"
                >
                  Start now
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-[#ccff00] text-black font-extrabold text-sm uppercase"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
