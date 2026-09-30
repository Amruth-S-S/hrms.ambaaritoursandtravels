"use client";

import { useState } from "react";
import { useFetch } from "@/lib/useFetch";
import { fmtDay, fmtDuration, fmtTime, monthNow, shortAddress } from "@/lib/format";
import Selfie from "@/components/Selfie";
import { Badge, Empty, ErrorNote, PageHeader, Spinner, Stat, StatusBadge, TableWrap } from "@/components/ui";

export default function MyAttendance() {
  const [month, setMonth] = useState(monthNow());
  const { data, loading, error, reload } = useFetch("/attendance/me", { month });
  const s = data?.summary;

  return (
    <>
      <PageHeader
        title="My attendance"
        actions={<input type="month" className="input w-44" value={month} max={monthNow()} onChange={(e) => setMonth(e.target.value)} aria-label="Month" />}
      />
      <ErrorNote message={error} onRetry={reload} />
      {loading && !data ? (
        <Spinner />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <Stat label="Present" value={s.present} tone="green" />
            <Stat label="Half days" value={s.half_day} />
            <Stat label="Absent" value={s.absent} tone={s.absent ? "red" : undefined} />
            <Stat label="Leave" value={s.paid_leave + s.unpaid_leave} />
            <Stat label="Late" value={s.late} tone={s.late ? "amber" : undefined} />
          </div>
          <TableWrap>
            {!data.records.length ? (
              <Empty title="No attendance this month" />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check in</th>
                    <th>Check out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((r) => (
                    <tr key={r.id}>
                      <td className="num whitespace-nowrap font-semibold">{fmtDay(r.date)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Selfie id={r.check_in?.selfie_id} label="Check-in selfie" size={36} />
                          <div>
                            <div className="num font-semibold">{fmtTime(r.check_in?.time)}</div>
                            <div className="text-xs text-ink-muted max-w-[200px] truncate">{shortAddress(r.check_in?.address, 2)}</div>
                          </div>
                          {r.is_late && <Badge tone="amber">Late</Badge>}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {r.check_out && <Selfie id={r.check_out?.selfie_id} label="Check-out selfie" size={36} />}
                          <div className="num font-semibold">{fmtTime(r.check_out?.time)}</div>
                        </div>
                      </td>
                      <td className="num">{r.check_out ? fmtDuration(r.work_minutes) : "—"}</td>
                      <td>
                        <StatusBadge status={r.status} />
                        {r.remarks && <div className="text-xs text-ink-muted mt-1">{r.remarks}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TableWrap>
        </>
      ) : null}
    </>
  );
}
