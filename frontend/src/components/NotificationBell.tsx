"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NotificationItem,
} from "@/lib/api";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Check,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const session = getSession();
    if (!session) return;
    try {
      const data = await fetchMyNotifications(session.token);
      setUnreadCount(data.unread_count);
      setNotifications(data.notifications);
    } catch {
      // Background poll failure handled gracefully
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, actionUrl?: string | null) => {
    const session = getSession();
    if (!session) return;
    try {
      await markNotificationRead(session.token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignored
    }
    if (actionUrl) {
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    const session = getSession();
    if (!session) return;
    try {
      setLoading(true);
      await markAllNotificationsRead(session.token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PHASE_PASSED":
      case "ACCOUNT_FUNDED":
      case "KYC_APPROVED":
        return <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />;
      case "RULE_BREACHED":
      case "KYC_REJECTED":
        return <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />;
      case "PAYOUT_PAID":
      case "CERTIFICATE_ISSUED":
        return <Award size={16} className="text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Zap size={16} className="text-brand-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-brand-500 text-gray-300 hover:text-white transition"
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Alert Feed
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-medium text-slate-400 hover:text-brand-400 transition flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* Feed List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No alerts recorded. Platform events will appear here in real-time.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.action_url)}
                  className={`p-3.5 hover:bg-slate-800/40 transition cursor-pointer flex gap-3 ${
                    !n.is_read ? "bg-slate-800/20" : ""
                  }`}
                >
                  {getIcon(n.notification_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-bold truncate ${!n.is_read ? "text-white" : "text-slate-300"}`}>
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>{new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {n.action_url && (
                        <Link
                          href={n.action_url}
                          className="text-brand-400 hover:underline flex items-center gap-0.5"
                        >
                          View <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
