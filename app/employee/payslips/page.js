"use client";

import { useState } from "react";
import { useFetch } from "@/lib/useFetch";
import { money, monthLabel } from "@/lib/format";
import PayslipModal from "@/components/Payslip";
import { Button, Empty, ErrorNote, PageHeader, Spinner, StatusBadge, TableWrap } from "@/components/ui";

export default function MyPayslips() {
  const { data, loading, error, reload } = useFetch("/payroll/me");
  const { data: company } = useFetch("/settings");
  const [viewing, setViewing] = useState(null);

  return (
    <>
      <PageHeader title="Payslips" />
      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="No payslips yet">Payslips appear here once your administrator runs payroll.</Empty>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Month</th><th className="text-right">Gross</th><th className="text-right">Deductions</th><th className="text-right">Net pay</th><th>Status</th><th><span className="sr-only">View</span></th></tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold">{monthLabel(p.month)}</td>
                  <td className="num text-right">{money(p.gross)}</td>
                  <td className="num text-right">{money(p.lop_deduction + (p.other_deductions || 0))}</td>
                  <td className="num text-right font-bold">{money(p.net_pay)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><Button size="sm" variant="secondary" onClick={() => setViewing(p)}>View payslip</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
      <PayslipModal slip={viewing} companyName={company?.company_name} onClose={() => setViewing(null)} />
    </>
  );
}
