"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUPPORT_EMAIL = "support@riffmaxfunding.com";

const topics = [
  "Account Provisioning Issue",
  "Payment / Billing Question",
  "Payout Request Help",
  "Rule Clarification",
  "Technical / MT5 Issue",
  "KYC / Compliance",
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
    // In production this will POST to /api/v1/support/ticket
    // For now, simulate success
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Contact <span className="text-emerald-400">Support</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Our team responds within 1 business day. For urgent issues, include
          your account email and purchase ID in your message.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24 grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-400 mb-1 text-sm uppercase tracking-wider">Email Support</h3>
            <p className="text-white font-semibold">{SUPPORT_EMAIL}</p>
            <p className="text-gray-500 text-xs mt-1">Response time: within 1 business day</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-400 mb-1 text-sm uppercase tracking-wider">Support Hours</h3>
            <p className="text-white text-sm">Monday – Friday</p>
            <p className="text-gray-400 text-sm">09:00 – 18:00 UTC</p>
            <p className="text-gray-500 text-xs mt-1">We do not offer live chat at this time.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-400 mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "Challenge Rules", href: "/rules" },
                { label: "Trading Conditions", href: "/trading-conditions" },
                { label: "Payout Policy", href: "/payout-policy" },
                { label: "Refund Policy", href: "/refund-policy" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  → {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-white mb-2">Message Received</h3>
              <p className="text-gray-400 text-sm">
                We&apos;ve received your message and will respond to{" "}
                <span className="text-emerald-400">{email}</span> within 1 business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-bold mb-2">Send a Message</h2>
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
