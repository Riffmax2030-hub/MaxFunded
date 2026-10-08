"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NotificationItem,
} from "@/lib/api";

interface NotificationBellProps {
  token: string;
}

function relativeTime(isoStr: string): string {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  INFO:    { icon: <Info    size={14} />, color: "text-blue-400",    bg: "bg-blue-500/10"    },
  SUCCESS: { icon: <CheckCircle2 size={14} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  WARNING: { icon: <AlertTriangle size={14} />, color: "text-amber-400",  bg: "bg-amber-500/10"  },
  DANGER:  { icon: <AlertOctagon size={14} />, color: "text-rose-400",   bg: "bg-rose-500/10"   },
};

export default function NotificationBell({ token }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<{ unread_count: number; notifications: NotificationItem[] }>({
    unread_count: 0,
    notifications: [],
  });
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchNotifications(token);
      setFeed(data);
    } catch {
      // silent fail
    }
  }, [token]);

  // Initial + periodic polling every 30s
  useEffect(() => {
    if (!token) return;
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load, token]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(token, id);
      setFeed((prev) => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count - 1),
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
      }));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsRead(token);
      setFeed((prev) => ({
        unread_count: 0,
        notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
      }));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  const { unread_count, notifications } = feed;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
        title="Notifications"
      >
        <Bell size={18} />
        {unread_count > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 leading-none shadow-lg">
            {unread_count > 99 ? "99+" : unread_count}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-[360px] max-w-[92vw] bg-[#0d0e10] border border-white/10 rounded-2xl shadow-2xl z-[200] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-[#ccff00]" />
              <span className="text-sm font-bold text-white">Notifications</span>
              {unread_count > 0 && (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-1.5 py-0.5 rounded-full">
                  {unread_count} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread_count > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-[#ccff00] transition font-semibold"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-neutral-500 hover:text-white transition">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-500 gap-2">
                <CheckCircle2 size={28} className="text-neutral-700" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-neutral-600">No new notifications.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const itemType = (n as any).notification_type || (n as any).type || "INFO";
                const cfg = TYPE_CONFIG[itemType] || TYPE_CONFIG.INFO;
                const itemBody = (n as any).message || (n as any).body || "";
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${
                      !n.is_read ? "border-l-2 border-l-[#ccff00] bg-[#ccff00]/[0.03]" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug ${n.is_read ? "text-neutral-300" : "text-white"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-neutral-600 shrink-0 mt-0.5">{relativeTime(n.created_at)}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{itemBody}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] mt-1 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.07] text-center">
            <p className="text-[10px] text-neutral-600">Notifications auto-refresh every 30s</p>
          </div>
        </div>
      )}
    </div>
  );
}
