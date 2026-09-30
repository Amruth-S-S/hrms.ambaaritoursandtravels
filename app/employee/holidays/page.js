"use client";

import { useFetch } from "@/lib/useFetch";
import { fmtDate, todayISO } from "@/lib/format";
import { Empty, ErrorNote, PageHeader, Spinner, TableWrap } from "@/components/ui";

export default function EmployeeHolidays() {
  const year = new Date().getFullYear();
  const { data, loading, error, reload } = useFetch("/holidays", { year });
  const today = todayISO();

  return (
    <>
      <PageHeader title={`Holidays in ${year}`} />
      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="No holidays published yet" />
        ) : (
          <table className="tbl">
            <thead><tr><th>Date</th><th>Holiday</th></tr></thead>
            <tbody>
              {data.map((h) => (
                <tr key={h.id} className={h.date < today ? "text-ink-muted" : ""}>
                  <td className="num whitespace-nowrap">{fmtDate(h.date, { weekday: "long", day: "numeric", month: "long" })}</td>
                  <td className="font-semibold">
                    {h.name}
                    {h.description && <div className="text-xs font-normal text-ink-muted">{h.description}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
    </>
  );
}
