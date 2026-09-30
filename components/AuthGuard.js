"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { FullPageSpinner } from "./ui";

export default function AuthGuard({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (role && user.role !== role) router.replace(user.role === "admin" ? "/admin" : "/employee");
  }, [user, loading, role, router]);

  if (loading || !user || (role && user.role !== role)) return <FullPageSpinner />;
  return children;
}
