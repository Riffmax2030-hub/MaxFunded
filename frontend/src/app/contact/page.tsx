"use client";

import { useState } from "react";
import { BRAND } from "@/lib/branding";
import { Mail, Clock, ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";
import {
  DiscordIcon,
  TelegramIcon,
  XIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/SocialIcons";

const topics = [
  "Account Provisioning & Credentials",
  "Payment & Billing Assistance",
  "Payout Request Inquiries",
  "Risk Rule Clarifications",
  "Technical Platform Support",
  "KYC & Compliance Verification",
  "Affiliate & Partnership Inquiries",
  "Other",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    // Simulate support ticket submission
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Contact <span className="text-[#ccff00]">Support</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Our global operations desk operates 24/7. Average response time is under 2 hours.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24 grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-[#ccff00]" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Direct Desk Email</h3>
            </div>
            <p className="text-[#ccff00] font-semibold font-mono text-sm">{BRAND.supportEmail}</p>
            <p className="text-slate-400 text-xs mt-2">
              For security, always email us from your registered account email address.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Trading Hours & Desk Operations</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Server Time: <span className="text-white font-mono font-semibold">UTC+2 / UTC+3 (EET/EEST)</span>
            </p>
            <p className="text-slate-400 text-xs mt-2">
              Automated risk checks and breach evaluations operate continuously without pause.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Compliance & Legal</h3>
            </div>
            <p className="text-slate-300 text-xs font-mono">{BRAND.complianceEmail}</p>
            <p className="text-slate-400 text-xs mt-2">
              Identity verification, sanction checks, and corporate documentation.
            </p>
          </div>

          {/* Official Community Desks */}
          <div className="bg-slate-900 border border-[#ccff00]/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-[#ccff00]" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Trader Communities & Socials</h3>
            </div>
            <p className="text-slate-400 text-xs mb-4">
              Join active traders on Discord or follow our official social media channels:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={BRAND.socials.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2] text-[#858df9] hover:text-white border border-[#5865F2]/30 text-xs font-bold transition"
              >
                <DiscordIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">Discord Server</span>
              </a>
              <a
                href={BRAND.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9] text-[#7bd2f7] hover:text-white border border-[#229ED9]/30 text-xs font-bold transition"
              >
                <TelegramIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">Telegram Desk</span>
              </a>
              <a
                href={BRAND.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white text-neutral-300 hover:text-black border border-white/10 text-xs font-bold transition"
              >
                <XIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">X (Twitter)</span>
              </a>
              <a
                href={BRAND.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FF0000]/20 hover:bg-[#FF0000] text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition"
              >
                <YoutubeIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">YouTube Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Ticket Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-2xl font-bold text-white">Ticket Created</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Thank you for reaching out. A support officer will inspect your inquiry and reply to <strong className="text-white">{email}</strong> shortly.
              </p>
              <button
                onClick={() => { setSubmitted(false); setName(""); setEmail(""); setMessage(""); }}
                className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">Create Support Ticket</h2>

              {error && (
                <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00] transition"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Registered Account Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00] transition"
                  placeholder="trader@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Inquiry Category</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00] transition"
                >
                  {topics.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Message Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00] resize-none transition"
                  placeholder="Provide account ID, MT5 login, or issue details..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs py-3.5 rounded-xl transition shadow-lg shadow-[#ccff00]/10"
              >
                Submit Support Ticket
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
