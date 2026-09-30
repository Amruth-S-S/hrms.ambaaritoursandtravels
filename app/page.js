"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { FullPageSpinner } from "@/components/ui";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(!user ? "/login" : user.role === "admin" ? "/admin" : "/employee");
  }, [user, loading, router]);
  return <FullPageSpinner />;
}
