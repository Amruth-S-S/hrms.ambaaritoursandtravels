"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";
import { fmtDateTime, fmtDay, fmtDuration, LEAVE_LABEL, money, monthLabel } from "@/lib/format";
import PunchCard from "@/components/PunchCard";
import { Badge, Spinner, Stat } from "@/components/ui";

function SalaryCard({ salary, month }) {
  if (!salary?.monthly_salary) return null;
  const cut = salary.late_deduction;
  const keptPct = Math.max(0, Math.min(100, (salary.remaining / salary.monthly_salary) * 100));
  return (
    <section className="panel mt-6 overflow-hidden">
      <div className="bg-gradient-to-r from-navy to-brand-dark px-5 py-4 text-white">
        <p className="text-sm text-white/70">Salary for {monthLabel(month)} after late deductions</p>
        <p className="num mt-1 text-3xl font-extrabold tracking-tight">{money(salary.remaining)}</p>
        <div className="mt-3 h-1.5 rounded-full bg-white/20" aria-hidden>
          <div className="h-full rounded-full bg-white" style={{ width: `${keptPct}%` }} />
        </div>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
        <div className="px-5 py-3">
          <dt className="text-xs text-ink-muted">Monthly salary</dt>
          <dd className="num mt-0.5 text-lg font-bold">{money(salary.monthly_salary)}</dd>
        </div>
        <div className="px-5 py-3">
          <dt className="text-xs text-ink-muted">Late cut so far</dt>
          <dd className={`num mt-0.5 text-lg font-bold ${cut ? "text-brick" : ""}`}>{cut ? `− ${money(cut)}` : money(0)}</dd>
          <dd className="text-xs text-ink-muted">
            {salary.late_minutes ? `${fmtDuration(salary.late_minutes)} late in total` : "No late arrivals"}
          </dd>
        </div>
        <div className="px-5 py-3">
          <dt className="text-xs text-ink-muted">Rule for your salary</dt>
          <dd className="num mt-0.5 text-lg font-bold">{money(salary.fine_per_5_min)}</dd>
          <dd className="text-xs text-ink-muted">cut for every 5 minutes late</dd>
        </div>
      </dl>
    </section>
  );
}

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

          <SalaryCard salary={data.salary} month={s.month} />

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
