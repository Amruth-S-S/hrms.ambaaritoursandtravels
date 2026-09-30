"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarCheck, Eye, EyeOff, MapPin, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button, Field, Input } from "@/components/ui";
import { Logo } from "@/components/Shell";

const FEATURES = [
  { icon: MapPin, text: "Selfie and location check-in" },
  { icon: CalendarCheck, text: "Leave, holidays and attendance" },
  { icon: Wallet, text: "Payslips, ready every month" },
];

function LoginForm() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(user.role === "admin" ? "/admin" : "/employee");
  }, [user, loading, router]);

  const notice = params.get("idle")
    ? "You were logged out after 30 minutes without activity."
    : params.get("expired")
    ? "Your session has ended. Log in again to continue."
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await login(email.trim(), password);
      router.replace(u.role === "admin" ? "/admin" : "/employee");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.1fr_1fr] bg-coal lg:bg-white">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16 bg-gradient-to-br from-navy via-[#0F3A8C] to-brand text-white">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#5FA2FF]/25 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          aria-hidden
        />

        <Logo className="relative w-56" />

        <div className="relative">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
            Team portal
          </p>
          <h2 className="mt-5 text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-xl">
            Your team, <span className="text-brand-gradient">on time</span>, every journey.
          </h2>
          <p className="mt-6 text-lg text-white/75 max-w-md leading-relaxed">
            Attendance, leave and payroll for the Ambaari Tours and Travels crew, all in one place.
          </p>
          <ul className="mt-10 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/55">Login and logout times are recorded automatically.</p>
      </div>

      {/* Form */}
      <div className="relative flex flex-col items-center justify-start lg:justify-center overflow-hidden">
        {/* Mobile hero */}
        <div className="lg:hidden relative w-full overflow-hidden bg-gradient-to-br from-navy via-[#0F3A8C] to-brand px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-24 text-center text-white">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <Logo className="relative mx-auto w-48" />
          <p className="relative mt-5 text-sm text-white/75">Attendance, leave and payroll in one place.</p>
        </div>

        <div className="relative w-full max-w-sm px-5 -mt-16 lg:mt-0 pb-10 lg:p-0">
          <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xl shadow-navy/10 lg:border-0 lg:p-0 lg:shadow-none">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sign in</h1>
            <p className="mt-1.5 text-sm text-ink-muted">Use the email and password your administrator gave you.</p>

            {notice && <p className="mt-5 rounded-lg border border-marigold/30 bg-marigold-light px-3 py-2 text-sm text-marigold">{notice}</p>}
            {error && <p className="mt-5 rounded-lg border border-brick/30 bg-brick-light px-3 py-2 text-sm text-brick" role="alert">{error}</p>}

            <div className="mt-7 space-y-4">
              <Input
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@ambaari.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field label="Password">
                <div className="relative">
                  <input
                    className="input pr-11"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-muted hover:text-brand"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>
            <Button type="submit" className="w-full mt-7 h-12 text-base" loading={busy}>
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-ink-muted">
            © {new Date().getFullYear()} Ambaari Tours and Travels
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
