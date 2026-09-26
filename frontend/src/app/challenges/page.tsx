"use client";

import React, { useEffect, useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import { fetchChallenges, Challenge } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges()
      .then((data) => {
        setChallenges(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load challenges");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Select Your Evaluation Scale
        </h1>
        <p className="text-sm text-gray-400">
          Choose a simulated account tier that matches your trading risk parameters. All tiers feature deterministic rule monitoring and clear reward splits.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
          <p className="text-sm">Loading evaluation challenges...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-red-950/30 border border-red-800 text-center text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  );
}
