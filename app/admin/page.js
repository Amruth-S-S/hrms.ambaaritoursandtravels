"use client";

import Link from "next/link";
import { useFetch } from "@/lib/useFetch";
import { fmtDate, fmtDay, fmtTime } from "@/lib/format";
import LocationCell from "@/components/LocationCell";
import Selfie from "@/components/Selfie";
import { Badge, Empty, ErrorNote, PageHeader, Spinner, Stat } from "@/components/ui";

function Trend({ trend, total }) {
  const max = Math.max(total, ...trend.map((t) => t.present), 1);
  return (
    <div className="flex items-end gap-2 h-36" role="img" aria-label="Employees present over the last 7 days">
      {trend.map((t) => (
        <div key={t.date} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="num text-xs font-semibold">{t.present}</span>
          <div className="w-full rounded-t bg-gradient-to-t from-brand/60 to-brand" style={{ height: `${Math.max(3, (t.present / max) * 100)}px` }} />
          <span className="text-[11px] text-ink-muted">{fmtDate(t.date, { weekday: "short" })}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch("/dashboard/admin");

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;
  const d = data;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={fmtDate(d.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Checked in today" value={`${d.today.checked_in} / ${d.employees.active}`} tone="green" />
        <Stat label="Late arrivals" value={d.today.late} tone={d.today.late ? "amber" : undefined} />
        <Stat label="On leave" value={d.today.on_leave} />
        <Stat label="Not checked in" value={d.today.not_in} tone={d.today.not_in ? "red" : undefined} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel p-5 lg:col-span-2">
          <h2 className="font-bold">Attendance this week</h2>
          <div className="mt-5">
            <Trend trend={d.trend} total={d.employees.active} />
          </div>
        </section>

        <section className="panel p-5 space-y-4">
          <h2 className="font-bold">Needs attention</h2>
          <Link href="/admin/leaves" className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-mist">
            <span className="text-sm">Pending leave requests</span>
            <Badge tone={d.pending_leaves ? "amber" : "gray"}>{d.pending_leaves}</Badge>
          </Link>
          <Link href="/admin/sessions" className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-mist">
            <span className="text-sm">Signed in right now</span>
            <Badge tone="green">{d.online_now}</Badge>
          </Link>
          <Link href="/admin/employees" className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-mist">
            <span className="text-sm">Active employees</span>
            <Badge>{d.employees.active}</Badge>
          </Link>
          <div>
            <h3 className="text-sm font-semibold mt-2">Upcoming holidays</h3>
            {d.upcoming_holidays.length === 0 ? (
              <p className="text-sm text-ink-muted mt-1">None scheduled.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {d.upcoming_holidays.map((h) => (
                  <li key={h.id} className="flex justify-between gap-2">
                    <span>{h.name}</span>
                    <span className="text-ink-muted num">{fmtDay(h.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="panel mt-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-bold">Latest check-ins</h2>
          <Link href="/admin/attendance" className="text-sm font-semibold text-brand hover:underline">View all attendance</Link>
        </div>
        {d.recent_checkins.length === 0 ? (
          <Empty title="No one has checked in yet today" />
        ) : (
          <ul className="divide-y divide-line">
            {d.recent_checkins.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                <Selfie id={r.check_in?.selfie_id} label={`${r.employee.name} check-in`} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{r.employee.name}</div>
                  <div className="text-xs text-ink-muted">{r.employee.employee_code}</div>
                </div>
                <div className="hidden md:block"><LocationCell block={r.check_in} /></div>
                <div className="text-right">
                  <div className="num font-semibold text-sm">{fmtTime(r.check_in?.time)}</div>
                  {r.is_late && <Badge tone="amber">Late</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
