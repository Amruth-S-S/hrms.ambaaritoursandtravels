"use client";

import { CalendarCheck, CalendarDays, CalendarHeart, Home, UserRound, Wallet } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Shell from "@/components/Shell";

const NAV = [
  { href: "/employee", label: "Today", icon: Home },
  { href: "/employee/attendance", label: "My attendance", short: "Attendance", icon: CalendarCheck },
  { href: "/employee/leaves", label: "Leave", icon: CalendarDays },
  { href: "/employee/payslips", label: "Payslips", icon: Wallet },
  { href: "/employee/holidays", label: "Holidays", icon: CalendarHeart },
  { href: "/employee/profile", label: "Profile", icon: UserRound },
];

export default function EmployeeLayout({ children }) {
  return (
    <AuthGuard role="employee">
      <Shell nav={NAV}>{children}</Shell>
    </AuthGuard>
  );
}
