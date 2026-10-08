"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession, clearSession, AuthSession } from "@/lib/auth";
import Logo from "@/components/Logo";
import CountryFlag from "@/components/CountryFlag";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Settings,
} from "lucide-react";


export default function Navbar() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({
    code: "en-gb",
    label: "English",
  });
  const pathname = usePathname();

  useEffect(() => {
    setSession(getSession());
    try {
      const savedLang = localStorage.getItem("preferred_lang");
      if (savedLang) {
        setSelectedLang(JSON.parse(savedLang));
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  const handleLanguageChange = (l: { code: string; label: string }) => {
    setSelectedLang(l);
    setLangOpen(false);
    try {
      localStorage.setItem("preferred_lang", JSON.stringify(l));

      let target = "en";
      if (l.code === "de") target = "de";
      else if (l.code === "fr") target = "fr";
      else if (l.code === "es") target = "es";
      else if (l.code === "ae") target = "ar";
      else if (l.code === "jp") target = "ja";
      else if (l.code.startsWith("en")) target = "en";

      if (target === "en") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
      } else {
        document.cookie = `googtrans=/en/${target}; path=/;`;
        document.cookie = `googtrans=/en/${target}; domain=${window.location.hostname}; path=/;`;
      }
      window.location.reload();
    } catch (e) {
      console.error("Failed to set language", e);
      window.location.reload();
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    window.location.href = "/";
  };

  const languages = [
    { code: "en-gb", label: "English (UK)" },
    { code: "en-us", label: "English (US)" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "ae", label: "العربية" },
    { code: "ng", label: "Nigeria" },
    { code: "jp", label: "日本語" },
  ];

  // Clean public marketing links — NO internal app routes
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/challenges", label: "Challenges" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/rules", label: "Rules" },
    { href: "/about", label: "About Us" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header
      className="fixed top-0 left-0 w-full z-[9999] transition-all"
      style={{
        height: "72px",
        display: "flex",
        alignItems: "center",
        background: "rgba(6, 7, 9, 0.78)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-6">
        
        {/* TOP LEFT CORNER: Max Funded Proprietary Firm Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center group transition-transform hover:opacity-95">
            <Logo size="md" />
          </Link>
        </div>

        {/* CENTER NAVIGATION: Public Links Only */}
        <nav className="hidden lg:flex items-center space-x-7 xl:space-x-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 text-base xl:text-[17px] font-bold tracking-tight transition-colors duration-200 py-1.5 ${
                  isActive
                    ? "text-[#ccff00] font-black"
                    : "text-neutral-200 hover:text-white"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-6px] left-0 right-0 h-[2.5px] bg-[#ccff00] rounded-full shadow-[0_0_10px_#ccff00]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* TOP RIGHT CORNER: Language Selector + User State */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-bold text-neutral-200 hover:text-white rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition shadow-sm"
              title="Select Language"
            >
              <CountryFlag code={selectedLang.code} size={14} />
              <span className="hidden sm:inline font-semibold text-xs text-neutral-200">{selectedLang.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#101318]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-white/5">
                  Language &amp; Region
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition ${
                        selectedLang.code === l.code
                          ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                          : "text-neutral-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CountryFlag code={l.code} size={15} />
                        <span className="font-medium">{l.label}</span>
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

          {/* User Session or Clean Login / Start Now CTAs */}
          {session && pathname !== "/login" ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {session.isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <NotificationBell token={session.token} />
              <Link
                href="/settings"
                className="p-2 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/5"
                title="Account Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-full bg-[#ccff00] hover:bg-[#d4ff33] text-black transition shadow-[0_0_15px_rgba(204,255,0,0.2)]"
              >
                <LayoutDashboard className="w-4 h-4 text-black" />
                <span>Dashboard</span>
              </Link>
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
              {pathname !== "/login" && (
                <Link
                  href="/login"
                  className="text-xs sm:text-[15px] font-bold text-neutral-200 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
                >
                  Log in
                </Link>
              )}
              <Link
                href="/challenges"
                className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-black text-xs sm:text-[14px] tracking-tight uppercase transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-[0_4px_25px_rgba(255,255,255,0.25)]"
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

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0e10]/98 border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-lg font-bold text-neutral-200 hover:text-[#ccff00] transition"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {!session || pathname === "/login" ? (
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
              <>
                {session.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-slate-800 text-white font-bold text-sm"
                  >
                    Admin Console
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-[#ccff00] text-black font-extrabold text-sm uppercase"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-xl bg-red-500/10 text-rose-400 font-semibold text-sm"
                >
                  Log out
                </button>
              </>
            )}
          </div>

          {/* Mobile Language Switcher */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Language & Region</p>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setMobileMenuOpen(false); handleLanguageChange(l); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition border ${
                    selectedLang.code === l.code
                      ? "bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/30 font-bold"
                      : "text-neutral-300 border-white/10 bg-white/5"
                  }`}
                >
                  <CountryFlag code={l.code} size={14} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
