"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { fmtDateTime, fmtDuration, LOGOUT_REASON, todayISO } from "@/lib/format";
import { Badge, Button, Empty, ErrorNote, PageHeader, Spinner, TableWrap } from "@/components/ui";

function device(ua = "") {
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac OS/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Unknown";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  return `${browser} on ${os}`.trim();
}

export default function SessionsPage() {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [userId, setUserId] = useState("");
  const { data: employees } = useFetch("/users");
  const { data, loading, error, reload } = useFetch("/sessions", { from_date: from, to_date: to, user_id: userId });

  const end = async (s) => {
    if (!window.confirm(`Sign ${s.employee.name} out of this session?`)) return;
    try {
      await api(`/sessions/${s.id}/end`, { method: "POST" });
      toast.success("Session ended");
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Login history" subtitle="Login and logout times are captured automatically for every account." />
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="date" className="input sm:w-44" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
        <input type="date" className="input sm:w-44" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        <select className="input sm:w-56" value={userId} onChange={(e) => setUserId(e.target.value)} aria-label="User">
          <option value="">Everyone</option>
          {(employees || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="No logins in this period" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Logged in</th>
                <th>Logged out</th>
                <th>Duration</th>
                <th>Device</th>
                <th>IP address</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="font-semibold">{s.employee.name}</div>
                    <div className="text-xs text-ink-muted">{s.employee.employee_code}</div>
                  </td>
                  <td className="num whitespace-nowrap">{fmtDateTime(s.login_at)}</td>
                  <td className="whitespace-nowrap">
                    {s.active ? (
                      <Badge tone="green">Signed in</Badge>
                    ) : (
                      <>
                        <div className="num">{fmtDateTime(s.logout_at)}</div>
                        <div className="text-xs text-ink-muted">{LOGOUT_REASON[s.logout_reason] || s.logout_reason}</div>
                      </>
                    )}
                  </td>
                  <td className="num">{s.active ? "—" : fmtDuration(s.duration_minutes)}</td>
                  <td className="text-xs">{device(s.user_agent)}</td>
                  <td className="num text-xs">{s.ip || "—"}</td>
                  <td>{s.active && <Button size="sm" variant="secondary" onClick={() => end(s)}>Sign out</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
    </>
  );
}
