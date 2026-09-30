"use client";

import {
  Building2, CalendarCheck, CalendarDays, CalendarHeart, History, LayoutDashboard,
  Megaphone, Settings, Users, Wallet,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Shell from "@/components/Shell";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/admin/leaves", label: "Leave requests", short: "Leave", icon: CalendarDays },
  { href: "/admin/payroll", label: "Payroll", icon: Wallet },
  { href: "/admin/sessions", label: "Login history", short: "Logins", icon: History },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/holidays", label: "Holidays", icon: CalendarHeart },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  return (
    <AuthGuard role="admin">
      <Shell nav={NAV}>{children}</Shell>
    </AuthGuard>
  );
}
