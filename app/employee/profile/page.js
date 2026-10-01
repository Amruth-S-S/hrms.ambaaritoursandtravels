"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";
import { fmtDate, fmtDateTime, fmtDuration, LOGOUT_REASON, weekOffLabel } from "@/lib/format";
import { Badge, Button, Input, PageHeader, Spinner } from "@/components/ui";

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium mt-0.5">{value || "—"}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: sessions } = useFetch("/sessions/me", { limit: 15 });
  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.new_password !== pw.confirm) return toast.error("New passwords do not match");
    setSavingPw(true);
    try {
      await api("/auth/change-password", { method: "POST", body: { current_password: pw.current_password, new_password: pw.new_password } });
      toast.success("Password changed");
      setPw({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" />
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <section className="panel p-5">
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className="text-sm text-ink-muted">{user.designation}{user.department_name && `, ${user.department_name}`}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4">
            <Detail label="Employee code" value={user.employee_code} />
            <Detail label="Email" value={user.email} />
            <Detail label="Date of joining" value={fmtDate(user.date_of_joining)} />
            <Detail label="Shift" value={user.shift_start ? `${user.shift_start} to ${user.shift_end}` : "Office hours"} />
            <Detail label="Week off" value={weekOffLabel(user)} />
          </dl>
          <p className="mt-4 text-xs text-ink-muted">Ask your administrator to change these details.</p>
        </section>

        <section className="panel p-5">
          <h2 className="font-bold">Contact details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="Phone" value={user.phone} />
            <Detail label="Emergency contact" value={user.emergency_contact} />
            <div className="sm:col-span-2">
              <dt className="text-xs text-ink-muted">Address</dt>
              <dd className="text-sm font-medium mt-0.5 whitespace-pre-line">{user.address || "—"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-ink-muted">Ask your administrator to update your contact details.</p>
        </section>

        <form onSubmit={changePassword} className="panel p-5 space-y-4">
          <h2 className="font-bold">Change password</h2>
          <Input label="Current password" type="password" required autoComplete="current-password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
          <Input label="New password" type="password" required minLength={6} autoComplete="new-password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
          <Input label="Confirm new password" type="password" required minLength={6} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <Button type="submit" loading={savingPw}>Change password</Button>
        </form>

        <section className="panel p-5">
          <h2 className="font-bold">Recent logins</h2>
          {!sessions ? (
            <Spinner />
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {sessions.map((s) => (
                <li key={s.id} className="py-2.5 flex justify-between gap-3">
                  <div>
                    <div className="num">{fmtDateTime(s.login_at)}</div>
                    <div className="text-xs text-ink-muted">
                      {s.active ? "Current or open session" : `${LOGOUT_REASON[s.logout_reason] || "Logged out"} at ${fmtDateTime(s.logout_at)}`}
                    </div>
                  </div>
                  {s.active ? <Badge tone="green">Active</Badge> : <span className="num text-ink-muted">{fmtDuration(s.duration_minutes)}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
