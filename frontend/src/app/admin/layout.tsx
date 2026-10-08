"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Database,
  Sliders,
  FileCheck,
  CreditCard,
  TrendingUp,
  Bell,
  Activity,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Users,
} from "lucide-react";

const adminNav = [
  {
    group: "Overview",
    items: [
      {
        href: "/admin",
        label: "Mission Control",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        href: "/admin/pool",
        label: "Account Pool",
        icon: Database,
      },
      {
        href: "/admin/challenges",
        label: "Challenge Tiers",
        icon: Sliders,
      },
      {
        href: "/admin/payouts",
        label: "Payout Queue",
        icon: CreditCard,
      },
      {
        href: "/admin/capital",
        label: "Capital Allocation",
        icon: TrendingUp,
      },
      {
        href: "/admin/users",
        label: "User Management",
        icon: Users,
      },
    ],
  },
  {
    group: "Compliance & Risk",
    items: [
      {
        href: "/admin/compliance",
        label: "KYC / Compliance",
        icon: FileCheck,
      },
    ],
  },
  {
    group: "System",
    items: [
      {
        href: "/admin/notifications",
        label: "Webhooks & Alerts",
        icon: Bell,
      },
      {
        href: "/admin/system",
        label: "System Health",
        icon: Activity,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.isAdmin) {
      router.push("/login?next=/admin");
      return;
    }
    setAdminEmail(session.email ?? "Admin");
  }, [router]);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <Link href="/admin" onClick={() => setSidebarOpen(false)}>
          <Logo size="sm" />
        </Link>
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <ShieldCheck size={10} />
          Admin Console
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {adminNav.map((group) => (
          <div key={group.group}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, "exact" in item ? item.exact : false);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        active
                          ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${active ? "text-[#ccff00]" : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                        {item.label}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {active && (
                          <ChevronRight className="w-3 h-3 text-[#ccff00]" />
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: Trader Link + Logout */}
      <div className="px-3 py-4 border-t border-white/[0.07] space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
        >
          <Users className="w-4 h-4 text-slate-500" />
          Trader View
        </Link>
        <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Logged in as</p>
          <p className="text-xs text-slate-300 font-bold truncate mt-0.5">{adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-[#0b0d10] border-r border-white/[0.06] fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay Sidebar ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-[#0b0d10] border-r border-white/[0.06] z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 lg:ml-60 xl:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-[#0b0d10]/95 backdrop-blur border-b border-white/[0.07] px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300"
          >
            <Menu size={18} />
          </button>
          <Link href="/admin">
            <Logo size="sm" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-rose-400"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 text-white">{children}</main>
      </div>
    </div>
  );
}
