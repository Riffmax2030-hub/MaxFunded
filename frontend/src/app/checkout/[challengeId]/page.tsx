"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DynamicCheckoutRedirect() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.challengeId as string;

  useEffect(() => {
    if (challengeId) {
      router.replace(`/checkout?challenge=${encodeURIComponent(challengeId)}`);
    }
  }, [challengeId, router]);

  return (
    <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center text-white">
      <Loader2 className="w-10 h-10 animate-spin text-[#ccff00] mb-3" />
      <p className="text-sm font-semibold text-neutral-400 font-mono">Redirecting to secure checkout...</p>
    </div>
  );
}
