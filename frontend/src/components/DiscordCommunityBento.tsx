"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Users, ShieldCheck, Zap, ArrowRight, ExternalLink } from "lucide-react";

export default function DiscordCommunityBento() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#858df9] font-mono text-xs font-bold uppercase tracking-wider mb-4">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>The MaxFunded Trading Floor</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Join 14,000+ Active <span className="text-[#ccff00]">Funded Traders</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
          Share high-probability setups, discuss daily economic releases, and get direct real-time support from our live risk desk.
        </p>
      </div>

      {/* Bento Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-5xl mx-auto">
        
        {/* Bento Card 1: Discord Main Invite Hub (7 cols) */}
        <div className="md:col-span-7 bg-[#0d0e14] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#5865F2]/50 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5865F2]/10 blur-3xl pointer-events-none rounded-full -z-10" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.01c3.931 1.794 8.18 1.794 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.077.077 0 0 1-.006.127c-.598.35-1.22.648-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">Official Discord Server</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>2,840 Members Online Now</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                24/7 Live
              </span>
            </div>

            <p className="text-neutral-300 text-sm leading-relaxed mb-6">
              Connect with profitable funded traders, share chart technicals, participate in weekly trading competitions, and celebrate verified payout receipts.
            </p>
          </div>

          <a
            href="https://discord.gg/maxfunded"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-extrabold text-xs sm:text-sm uppercase tracking-tight transition flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Join Official Discord Server</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Bento Card 2: Live Channels & Room Feeds (5 cols) */}
        <div className="md:col-span-5 bg-[#0d0e14] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Active Trading Channels
            </div>
            <h4 className="text-base font-extrabold text-white">
              What's Happening Inside
            </h4>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#121620] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-200">
                <span className="text-neutral-500 font-bold">#</span>
                <span className="font-semibold">daily-payout-proofs</span>
              </div>
              <span className="text-[10px] text-[#ccff00] font-bold">✓ Verified</span>
            </div>

            <div className="p-3 rounded-xl bg-[#121620] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-200">
                <span className="text-neutral-500 font-bold">#</span>
                <span className="font-semibold">live-trade-setups</span>
              </div>
              <span className="text-[10px] text-neutral-400">42 new messages</span>
            </div>

            <div className="p-3 rounded-xl bg-[#121620] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-200">
                <span className="text-neutral-500 font-bold">#</span>
                <span className="font-semibold">announcements-giveaways</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Weekly \$100K</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Direct Live Support Bot: Online</span>
            <span className="text-[#ccff00] font-bold">Free Access</span>
          </div>
        </div>

      </div>
    </section>
  );
}
