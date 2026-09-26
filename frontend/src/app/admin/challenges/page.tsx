"use client";

import React, { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { Challenge } from "@/lib/api";
import { Sliders, Plus, Edit2, Check, X, ShieldAlert, Loader2 } from "lucide-react";

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editProfitSplit, setEditProfitSplit] = useState("");

  const loadChallenges = async () => {
    const session = getSession();
    if (!session || !session.isAdmin) {
      window.location.href = "/login";
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/admin/challenges`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error("Failed to load admin challenges");
      const data = await res.json();
      setChallenges(data);
    } catch (err: any) {
      setError(err.message || "Failed to load admin controls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleSave = async (challenge: Challenge) => {
    const session = getSession();
    if (!session) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const payload = {
        price: editPrice ? parseFloat(editPrice) : parseFloat(challenge.price),
        rules: {
          profit_split_percentage: editProfitSplit
            ? parseFloat(editProfitSplit)
            : challenge.rules.profit_split_percentage,
        },
      };

      const res = await fetch(`${apiUrl}/admin/challenges/${challenge.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update challenge");
      setEditingId(null);
      loadChallenges();
    } catch (err: any) {
      alert(err.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
        <p className="text-sm">Loading admin control station...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-dark-700">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Challenge Management</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Configure challenge tiers, pricing, profit splits, and risk thresholds with immutable audit trails.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Challenges Table */}
      <div className="bg-dark-850 border border-dark-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-900 border-b border-dark-700 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Challenge Name</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Price (USD)</th>
                <th className="px-6 py-4">Profit Target</th>
                <th className="px-6 py-4">Daily Loss</th>
                <th className="px-6 py-4">Max DD</th>
                <th className="px-6 py-4">Profit Split</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/60">
              {challenges.map((c) => {
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-dark-800/50 transition">
                    <td className="px-6 py-4 font-semibold text-white">{c.name}</td>
                    <td className="px-6 py-4 font-mono">${Number(c.starting_balance).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-dark-900 border border-dark-600 text-white font-mono"
                        />
                      ) : (
                        `$${Number(c.price).toFixed(0)}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">
                      {c.rules?.profit_target_percentage}%
                    </td>
                    <td className="px-6 py-4 text-red-400 font-medium">
                      {c.rules?.max_daily_loss_percentage}%
                    </td>
                    <td className="px-6 py-4 text-red-400 font-medium">
                      {c.rules?.max_drawdown_percentage}%
                    </td>
                    <td className="px-6 py-4 text-purple-400 font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editProfitSplit}
                          onChange={(e) => setEditProfitSplit(e.target.value)}
                          className="w-16 px-2 py-1 rounded bg-dark-900 border border-dark-600 text-white font-mono"
                        />
                      ) : (
                        `${c.rules?.profit_split_percentage}%`
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSave(c)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setEditPrice(c.price);
                            setEditProfitSplit(c.rules?.profit_split_percentage?.toString() || "80");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 text-gray-200 flex items-center space-x-1 ml-auto"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Edit</span>
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
    </div>
  );
}
