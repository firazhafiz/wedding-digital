"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getActiveEventId, clearActiveEventId } from "@/lib/admin/context";
import LiveLink from "./LiveLink";
import type { EventInfo } from "@/types";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },

  {
    label: "Katalog",
    href: "/admin/events",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
        <path d="M8 7h6" />
        <path d="M8 11h8" />
      </svg>
    ),
  },
  {
    label: "Request",
    href: "/admin/requests",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Tamu",
    href: "/admin/guests",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Ucapan",
    href: "/admin/guestbook",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Check-in",
    href: "/admin/checkin",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: "Pengaturan",
    href: "/admin/settings",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventInfo | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchActiveEvent = async () => {
      const eventId = getActiveEventId();

      // If we are not on the events page and have no active event, redirect to katalog
      if (
        !eventId &&
        pathname !== "/admin/events" &&
        pathname !== "/admin/login" &&
        pathname !== "/admin/requests"
      ) {
        router.push("/admin/events");
        return;
      }

      if (eventId) {
        const supabase = createClient();
        const { data } = await supabase
          .from("event_info")
          .select("*")
          .eq("id", eventId)
          .single();
        if (data) {
          setActiveEvent(data as EventInfo);
        } else if (pathname !== "/admin/events") {
          // If event was deleted or not found but we have a cookie, clear it and redirect
          router.push("/admin/events");
        }
      }
    };
    fetchActiveEvent();
  }, [pathname, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    router.push("/admin/login");
    router.refresh();
  };

  const handleSwitchEvent = () => {
    clearActiveEventId();
    setActiveEvent(null);
    router.push("/admin/events");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-charcoal-dark transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-white/5 shrink-0">
            <h2 className="font-display text-xl text-off-white italic">
              Admin
            </h2>
            <p className="font-body text-[10px] text-white/30 uppercase tracking-widest mt-0.5">
              Wedding Dashboard
            </p>
            {activeEvent &&
              pathname !== "/admin/events" &&
              pathname !== "/admin/requests" && (
                <div className="mt-6 px-3 py-2.5 bg-gold/10 rounded-lg border border-gold/20 animate-fade-in group">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="text-[9px] uppercase font-bold text-gold/60 tracking-wider">
                        Wedding Aktif
                      </p>
                      <p className="text-[11px] text-white truncate font-medium">
                        {activeEvent.groom_name.split(" ")[0]} &{" "}
                        {activeEvent.bride_name.split(" ")[0]}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <button
                        onClick={() => {
                          handleSwitchEvent();
                          setSidebarOpen(false);
                        }}
                        className="text-[9px] font-bold text-white/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ganti</span>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <circle cx="12" cy="16" r="2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isKatalog = item.href === "/admin/events";
              const isRequest = item.href === "/admin/requests";

              // Define current mode
              const isOnManagementPage =
                pathname === "/admin/events" || pathname === "/admin/requests";

              // 1. If on Katalog or Request page, ONLY show those two management menus
              if (isOnManagementPage) {
                if (!isKatalog && !isRequest) return null;
              }
              // 2. If NOT on management page but NO event is selected, redirect-like behavior (show management)
              else if (!activeEvent) {
                if (!isKatalog && !isRequest) return null;
              }
              // 3. If NOT on management page AND an event IS selected, HIDE management menus
              else {
                if (isKatalog || isRequest) return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-body transition-all duration-200",
                    isActive
                      ? "bg-gold/10 text-gold shadow-sm"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5",
                  )}
                >
                  <span className={isActive ? "text-gold" : "text-white/40"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/5 shrink-0">
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-md text-sm font-body text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 md:px-0 md:py-0 flex items-center justify-between lg:justify-end">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-charcoal"
            aria-label="Menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
