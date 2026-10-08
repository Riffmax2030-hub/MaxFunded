"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getSession } from "@/lib/auth";
import { Challenge } from "@/lib/api";
import { SkeletonTable, PageError } from "@/components/AdminSkeleton";
import { Edit2, Check, X, Loader2, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editProfitSplit, setEditProfitSplit] = useState("");
  const [saveMsg, setSaveMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/admin/challenges`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setChallenges(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (c: Challenge) => {
    setEditingId(c.id);
    setEditPrice(c.price);
    setEditProfitSplit(c.rules?.profit_split_percentage?.toString() || "80");
    setSaveMsg(null);
  };

  const cancelEdit = () => { setEditingId(null); setSaveMsg(null); };

  const handleSave = async (c: Challenge) => {
    const session = getSession();
    if (!session) return;
    setSavingId(c.id);
    setSaveMsg(null);
    try {
      const res = await fetch(`${API}/admin/challenges/${c.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          price: editPrice ? parseFloat(editPrice) : parseFloat(c.price),
          rules: {
            profit_split_percentage: editProfitSplit
              ? parseFloat(editProfitSplit)
              : c.rules.profit_split_percentage,
          },
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setSaveMsg({ id: c.id, ok: true, text: "Saved" });
      setEditingId(null);
      // Optimistic update — refresh quietly in background
      load();
    } catch (e: unknown) {
      setSaveMsg({ id: c.id, ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="px-6 xl:px-10 pt-8 pb-20 space-y-6 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Challenge Tiers &amp; Pricing</h1>
          <p className="text-slate-500 text-sm mt-1">Edit fee pricing and profit-split % per tier.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition disabled:opacity-40"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Refresh
        </button>
      </div>

      {/* Inline save feedback */}
      {saveMsg && (
        <div className={`px-4 py-2.5 rounded-lg text-xs font-semibold border ${
          saveMsg.ok
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {saveMsg.text}
        </div>
      )}

      {/* Error */}
      {error && <PageError message={error} onRetry={load} />}

      {/* Skeleton while loading */}
      {loading && !challenges.length && <SkeletonTable rows={6} cols={8} />}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  {["Challenge", "Balance", "Price (USD)", "Profit Target", "Daily Loss", "Max DD", "Profit Split", ""].map(h => (
                    <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {challenges.map((c) => {
                  const isEditing = editingId === c.id;
                  const isSaving = savingId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-white whitespace-nowrap">{c.name}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">${Number(c.starting_balance).toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-white">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white font-mono focus:outline-none focus:border-[#ccff00]"
                          />
                        ) : `$${Number(c.price).toFixed(0)}`}
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{c.rules?.profit_target_percentage}%</td>
                      <td className="px-5 py-3.5 text-slate-300">{c.rules?.max_daily_loss_percentage}%</td>
                      <td className="px-5 py-3.5 text-slate-300">{c.rules?.max_drawdown_percentage}%</td>
                      <td className="px-5 py-3.5 font-bold text-white">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editProfitSplit}
                            onChange={(e) => setEditProfitSplit(e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white font-mono focus:outline-none focus:border-[#ccff00]"
                          />
                        ) : `${c.rules?.profit_split_percentage}%`}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSave(c)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ccff00] hover:bg-[#d4ff33] text-black text-xs font-bold transition disabled:opacity-50"
                            >
                              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
