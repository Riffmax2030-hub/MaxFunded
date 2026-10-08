/**
 * useWebSocket — real-time dashboard data via native WebSocket.
 *
 * Connects to wss://API_URL/api/v1/ws/dashboard?token=JWT
 * Automatically reconnects on drop (exponential back-off, max 30s).
 * Returns: { data, status, error }
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSession } from "@/lib/auth";

export type WSStatus = "connecting" | "connected" | "disconnected" | "error";

export interface DashboardWSData {
  purchase_id: string;
  challenge_name: string;
  account_size: number;
  phase: string;
  current_balance: number;
  current_equity: number;
  total_profit: number;
  total_profit_pct: number;
  open_positions: number;
  daily_drawdown_used_pct: number;
  daily_drawdown_limit_pct: number;
  max_drawdown_used_pct: number;
  max_drawdown_limit_pct: number;
  profit_target_pct: number;
  profit_target_reached_pct: number;
  profit_target_achieved: boolean;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  avg_profit_per_trade: number;
  avg_loss_per_trade: number;
  profit_factor: number | null;
  account_status: string;
  days_remaining: number | null;
  challenge_start_date: string | null;
  kyc_status: string;
  has_pending_payout: boolean;
  rule_compliance: Array<{
    rule_name: string;
    description: string;
    current_value: number | null;
    limit_value: number | null;
    percentage_used: number;
    is_breached: boolean;
    is_achieved: boolean;
  }>;
}

const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

function getWsUrl(token: string): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  // Convert http → ws, https → wss
  const wsBase = apiBase.replace(/^http/, "ws");
  return `${wsBase}/ws/dashboard?token=${encodeURIComponent(token)}`;
}

export function useDashboardWebSocket() {
  const [data, setData] = useState<DashboardWSData | null>(null);
  const [status, setStatus] = useState<WSStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retryDelay = useRef(BASE_DELAY);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const connect = useCallback(() => {
    if (!mounted.current) return;

    const session = getSession();
    if (!session?.token) {
      setStatus("error");
      setError("Not authenticated");
      return;
    }

    const url = getWsUrl(session.token);
    setStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mounted.current) return;
      setStatus("connected");
      setError(null);
      retryDelay.current = BASE_DELAY; // reset back-off on success
    };

    ws.onmessage = (event) => {
      if (!mounted.current) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "dashboard_update") {
          setData(msg.data as DashboardWSData);
          setNoAccount(false);
        } else if (msg.type === "no_account") {
          setNoAccount(true);
          setError(msg.message);
        } else if (msg.type === "error") {
          setError(msg.message);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      if (!mounted.current) return;
      setStatus("error");
    };

    ws.onclose = () => {
      if (!mounted.current) return;
      setStatus("disconnected");
      // Exponential back-off reconnect
      retryTimer.current = setTimeout(() => {
        if (mounted.current) {
          retryDelay.current = Math.min(retryDelay.current * 2, MAX_DELAY);
          connect();
        }
      }, retryDelay.current);
    };
  }, []);

  useEffect(() => {
    mounted.current = true;
    connect();

    const handleVisibility = () => {
      if (document.hidden) {
        if (wsRef.current) {
          wsRef.current.onclose = null;
          wsRef.current.close();
          setStatus("disconnected");
        }
      } else {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, status, error, noAccount };
}
