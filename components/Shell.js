"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, MoreHorizontal, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fmtTime } from "@/lib/format";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ambaari HRMS";
// Mobile bottom bar shows this many nav items; the rest live behind "More".
const TAB_COUNT = 4;

function LiveClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  return (
    <span className="num text-sm font-semibold text-ink">
      {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
    </span>
  );
}

/** variant "light" = white lettering for dark/blue backgrounds, "dark" = navy lettering for white. */
export function Logo({ className = "", variant = "light" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={variant === "dark" ? "/logo-dark.png" : "/logo.png"} alt="Ambaari Tours and Travels" width={640} height={211} className={`h-auto select-none ${className}`} draggable={false} />
  );
}

export default function Shell({ nav, children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href) =>
    href === pathname || (href.split("/").length > 2 && pathname.startsWith(href + "/"));

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const current = nav.find((n) => isActive(n.href));
  const tabs = nav.slice(0, TAB_COUNT);
  const moreActive = nav.slice(TAB_COUNT).some((n) => isActive(n.href));

  const signOut = () => {
    setLeaving(true);
    logout("manual");
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 w-[17rem] max-w-[85vw] bg-gradient-to-b from-navy to-navy-dark text-white flex flex-col shadow-xl lg:shadow-none transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top_left,rgb(var(--brand)/0.45),transparent_70%)]" aria-hidden />
        <div className="relative flex items-center justify-between px-5 pb-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
          <Link href={nav[0].href} aria-label={APP_NAME}>
            <Logo className="w-40" />
          </Link>
          <button className="lg:hidden btn h-9 w-9 p-0 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative mx-5 h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent" aria-hidden />

        <nav className="relative flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            {user?.role === "admin" ? "Admin" : "Workspace"}
          </p>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 h-11 lg:h-10 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-navy shadow-lg shadow-black/20"
                    : "text-white/70 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-brand" : "text-white/60 group-hover:text-white"}`} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="relative border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-white text-brand flex items-center justify-center text-sm font-bold ring-4 ring-white/15">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-white/55 truncate">{user?.designation || (user?.role === "admin" ? "Administrator" : "Employee")}</div>
            </div>
            <button className="lg:hidden btn h-9 w-9 p-0 text-white/70 hover:bg-white/10 hover:text-white" onClick={signOut} disabled={leaving} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <div
        className={`no-print fixed inset-0 z-30 bg-navy-dark/50 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Main */}
      <div className="lg:pl-[17rem]">
        <header className="no-print sticky top-0 z-20 pt-[env(safe-area-inset-top)] bg-gradient-to-r from-navy to-brand-dark text-white shadow-lg shadow-navy/20 lg:bg-none lg:bg-white/90 lg:text-ink lg:backdrop-blur-md lg:border-b lg:border-line lg:shadow-none">
          <div className="h-16 flex items-center justify-between gap-3 px-3 sm:px-6">
            {/* Mobile: menu, logo, log out */}
            <button className="lg:hidden btn h-11 w-11 p-0 text-white hover:bg-white/10" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
            <Link href={nav[0].href} className="lg:hidden flex-1 flex justify-center min-w-0" aria-label={APP_NAME}>
              <Logo className="w-36 max-w-full" />
            </Link>
            <button className="lg:hidden btn h-11 w-11 p-0 text-white hover:bg-white/10" onClick={signOut} disabled={leaving} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </button>

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-4 text-ink-muted text-sm">
              <span className="font-semibold text-ink">{current?.label}</span>
              <span className="h-4 w-px bg-line" aria-hidden />
              <LiveClock />
              {user?.session?.login_at && (
                <span>Logged in at <span className="num font-semibold text-brand">{fmtTime(user.session.login_at)}</span></span>
              )}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-ink">{user?.name}</div>
                <div className="text-xs text-ink-muted">{user?.role === "admin" ? "Administrator" : "Employee"}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={signOut} disabled={leaving}>
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 sm:px-6 py-5 sm:py-6 max-w-7xl pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">{children}</main>
      </div>

      {/* Mobile bottom bar */}
      <nav
        className="no-print lg:hidden fixed bottom-0 inset-x-0 z-20 bg-gradient-to-r from-navy to-brand-dark shadow-[0_-6px_20px_-8px_rgb(10_31_77/0.45)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Quick navigation"
      >
        <div className="grid px-1" style={{ gridTemplateColumns: `repeat(${tabs.length + (nav.length > TAB_COUNT ? 1 : 0)}, minmax(0, 1fr))` }}>
          {tabs.map(({ href, label, short, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-medium transition-colors ${active ? "text-white" : "text-white/60"}`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-white text-brand" : ""}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="truncate max-w-full px-1">{short || label}</span>
              </Link>
            );
          })}
          {nav.length > TAB_COUNT && (
            <button
              onClick={() => setOpen(true)}
              className={`flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-medium ${moreActive ? "text-white" : "text-white/60"}`}
            >
              <span className={`flex h-7 w-12 items-center justify-center rounded-full ${moreActive ? "bg-white text-brand" : ""}`}>
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </span>
              More
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
