"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  fetchAdminWebhooks,
  createAdminWebhook,
  testDispatchWebhook,
  WebhookConfigItem,
} from "@/lib/api";
import {
  Radio,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sliders,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New webhook modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [service, setService] = useState<"DISCORD" | "TELEGRAM" | "GENERIC">("DISCORD");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState("PHASE_PASSED,ACCOUNT_FUNDED,RULE_BREACHED,PAYOUT_PAID,CERTIFICATE_ISSUED");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Test dispatch status
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const loadData = async () => {
    const session = getSession();
    if (!session || !session.isAdmin) {
      setError("Administrator authorization required.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminWebhooks(session.token);
      setWebhooks(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load webhooks";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSession();
    if (!session) return;
    try {
      setSubmitting(true);
      setModalError(null);
      await createAdminWebhook(session.token, {
        name: name.trim(),
        target_service: service,
        webhook_url: url.trim(),
        events_subscribed: events.trim(),
      });
      setShowModal(false);
      setName("");
      setUrl("");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create webhook";
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestWebhook = async (w: WebhookConfigItem) => {
    const session = getSession();
    if (!session) return;
    try {
      setTestingId(w.id);
      setTestResult(null);
      const res = await testDispatchWebhook(session.token, {
        target_service: w.target_service,
        webhook_url: w.webhook_url,
        event_type: "PHASE_PASSED",
        custom_title: "Test Alert from MaxFunded Console",
        custom_message: `Verifying ${w.name} connectivity to ${w.target_service} channel.`,
      });
      setTestResult({
        id: w.id,
        success: res.dispatched,
        msg: res.dispatched ? "Payload dispatched successfully!" : "Remote webhook returned non-2xx status",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Test failed";
      setTestResult({ id: w.id, success: false, msg });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <>
      <main className="pb-20 px-6 xl:px-10 pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Webhooks &amp; Community Alerts</h1>
              <p className="text-slate-500 text-sm mt-1">
                Broadcast passes, payouts, and breaches live to Discord or Telegram.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ccff00] hover:bg-[#d4ff33] text-black font-bold text-xs transition"
              >
                <Plus size={14} /> Register Webhook
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-slate-900 border border-slate-800 rounded-2xl">
              <Loader2 className="animate-spin text-slate-400 mb-4" size={40} />
              <p className="text-slate-400 text-sm">Loading webhook configs...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
              <AlertTriangle className="text-red-400 mx-auto mb-3" size={40} />
              <p className="text-slate-300 text-sm">{error}</p>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                <Radio className="text-purple-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Webhooks Registered Yet</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Register a Discord webhook URL or Telegram Bot endpoint to celebrate live passes and payouts directly in your trading server.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#d4ff33] text-black font-bold text-sm transition"
              >
                <Plus size={16} /> Add Your First Webhook
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {webhooks.map((w) => (
                <div
                  key={w.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {w.target_service}
                      </span>
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{w.name}</h3>
                    <div className="font-mono text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate select-all mb-3">
                      {w.webhook_url}
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Events Subscribed:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {w.events_subscribed.split(",").map((ev) => (
                          <span
                            key={ev}
                            className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono"
                          >
                            {ev.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Test Status */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <button
                      onClick={() => handleTestWebhook(w)}
                      disabled={testingId === w.id}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition disabled:opacity-50"
                    >
                      {testingId === w.id ? (
                        <Loader2 size={14} className="animate-spin text-slate-400" />
                      ) : (
                        <Send size={14} />
                      )}
                      Dispatch Test Alert to {w.target_service}
                    </button>

                    {testResult && testResult.id === w.id && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-semibold ${
                          testResult.success
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {testResult.msg}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="text-purple-400" size={20} /> Register Community Webhook
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Webhook Name</label>
                <input
                  type="text"
                  placeholder="e.g. Discord #pass-announcements"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Service</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as "DISCORD" | "TELEGRAM" | "GENERIC")}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none"
                >
                  <option value="DISCORD">Discord Webhook (Rich Embeds)</option>
                  <option value="TELEGRAM">Telegram Bot (Channel / Group)</option>
                  <option value="GENERIC">Generic HTTP JSON Webhook</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Endpoint URL</label>
                <input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-[#ccff00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subscribed Events</label>
                <textarea
                  rows={2}
                  value={events}
                  onChange={(e) => setEvents(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:border-[#ccff00] focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Comma-separated event names or &apos;ALL&apos;.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#d4ff33] text-black font-bold transition disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : "Save Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
