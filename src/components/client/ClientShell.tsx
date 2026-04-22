"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ClientEventProvider } from "./ClientEventContext";
import type { EventInfo } from "@/types";

const navItems = [
  {
    label: "Dashboard",
    href: "/client",
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
    label: "Tamu",
    href: "/client/guests",
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
    href: "/client/guestbook",
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
    href: "/client/checkin",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
  },
  {
    label: "Pengaturan",
    href: "/client/settings",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
  },
];

interface ClientShellProps {
  children: React.ReactNode;
  eventId: string;
  clientLabel: string;
}

export default function ClientShell({
  children,
  eventId,
  clientLabel,
}: ClientShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventInfo | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Fetch event info for display
  useEffect(() => {
    const fetchEvent = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("event_info")
        .select("*")
        .eq("id", eventId)
        .single();
      if (data) setActiveEvent(data);
    };
    fetchEvent();
  }, [eventId]);

  const handleLogout = async () => {
    await fetch("/api/client/logout", { method: "POST" });
    toast.success("Berhasil logout");
    router.push("/client/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#0f1a2e] transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-white/5 shrink-0">
            <h2 className="font-display text-xl text-off-white italic">
              Client
            </h2>
            <p className="font-body text-[10px] text-white/30 uppercase tracking-widest mt-0.5">
              Event Dashboard
            </p>

            {activeEvent && (
              <div className="mt-4 px-3 py-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="font-body text-[10px] text-white/30 uppercase tracking-wider mb-1">
                  Event Aktif
                </p>
                <p className="font-body text-xs text-blue-300 font-semibold truncate">
                  {activeEvent.groom_name.split(" ")[0]} &{" "}
                  {activeEvent.bride_name.split(" ")[0]}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-body text-[10px] text-white/20 truncate">
                    {clientLabel}
                  </p>
                  <Link href="/client/events" className="text-[9px] bg-blue-500/80 text-white px-2 py-0.5 rounded-full hover:bg-blue-600 transition-colors">
                    Tukar
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/client" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-body font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-500/10 text-blue-400 shadow-sm"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5",
                  )}
                >
                  <span
                    className={isActive ? "text-blue-400" : "text-white/40"}
                  >
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
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 overflow-hidden min-w-0">
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
        <main className="flex-1 p-6 overflow-x-hidden">
          <ClientEventProvider eventId={eventId}>
            {children}
          </ClientEventProvider>
        </main>
      </div>
    </div>
  );
}
