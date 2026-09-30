"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";
import { fmtDateTime, fmtDay, fmtDuration, LEAVE_LABEL, monthLabel } from "@/lib/format";
import PunchCard from "@/components/PunchCard";
import { Badge, Spinner, Stat } from "@/components/ui";

export default function EmployeeHome() {
  const { user } = useAuth();
  const { data } = useFetch("/dashboard/employee");
  const first = user?.name?.split(" ")[0];
  const s = data?.month_summary;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Hello, {first}</h1>
      <PunchCard />

      {!data ? (
        <Spinner />
      ) : (
        <>
          <h2 className="mt-8 mb-3 font-bold">{monthLabel(s.month)} so far</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Days present" value={s.present + s.half_day * 0.5} hint={`of ${s.working_days} working days`} tone="green" />
            <Stat label="Late arrivals" value={s.late} tone={s.late ? "amber" : undefined} />
            <Stat label="Absent" value={s.absent} tone={s.absent ? "red" : undefined} />
            <Stat label="Hours worked" value={fmtDuration(s.work_minutes)} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="panel p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Leave balance</h2>
                <Link href="/employee/leaves" className="text-sm font-semibold text-brand hover:underline">Apply</Link>
              </div>
              <ul className="mt-3 divide-y divide-line">
                {["casual", "sick", "earned"].map((t) => (
                  <li key={t} className="flex justify-between py-2 text-sm">
                    <span>{LEAVE_LABEL[t]}</span>
                    <span className="num font-semibold">
                      {data.leave_balance[t].remaining} <span className="text-ink-muted font-normal">/ {data.leave_balance[t].quota}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {data.pending_leaves > 0 && <p className="mt-2 text-xs text-ink-muted">{data.pending_leaves} request(s) awaiting approval</p>}
            </section>

            <section className="panel p-5 lg:col-span-2">
              <h2 className="font-bold">Announcements</h2>
              {data.announcements.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">No announcements.</p>
              ) : (
                <ul className="mt-3 space-y-4">
                  {data.announcements.map((a) => (
                    <li key={a.id}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{a.title}</h3>
                        {a.priority === "important" && <Badge tone="amber">Important</Badge>}
                      </div>
                      <p className="text-sm mt-0.5 whitespace-pre-line">{a.body}</p>
                      <p className="text-xs text-ink-muted mt-1">{fmtDateTime(a.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {data.upcoming_holidays.length > 0 && (
            <section className="panel p-5 mt-6">
              <h2 className="font-bold">Upcoming holidays</h2>
              <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.upcoming_holidays.map((h) => (
                  <li key={h.id} className="rounded-md bg-mist px-3 py-2">
                    <div className="text-sm font-semibold">{h.name}</div>
                    <div className="text-xs text-ink-muted num">{fmtDay(h.date)}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
