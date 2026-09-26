"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, clearSession, AuthSession } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";
import { ShieldCheck, User, LogOut, LayoutDashboard, Sliders, Award, Users } from "lucide-react";

export default function Navbar() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-dark-900/80 border-b border-dark-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            RIFFMAX <span className="text-brand-500 font-light">FUNDING</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
          <Link href="/challenges" className="hover:text-white transition-colors">
            Challenges
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/rules" className="hover:text-white transition-colors">
            Rules
          </Link>
          <Link href="/trading-conditions" className="hover:text-white transition-colors">
            Conditions
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {session ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-dark-800 border border-dark-700 hover:border-brand-500 text-gray-200"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-500" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/certificates"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-dark-800 border border-dark-700 hover:border-amber-500 text-gray-200"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Certificates</span>
              </Link>
              <Link
                href="/affiliates"
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-dark-800 border border-dark-700 hover:border-brand-500 text-gray-200"
              >
                <Users className="w-4 h-4 text-brand-500" />
                <span>Affiliates</span>
              </Link>
              {session.isAdmin && (
                <Link
                  href="/admin/challenges"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-900/30 border border-purple-700 hover:bg-purple-900/50 text-purple-300"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-lg transition-all shadow-md shadow-brand-600/30"
              >
                Start Challenge
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
