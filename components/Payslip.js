"use client";

import { Printer } from "lucide-react";
import { fmtDate, money, monthLabel } from "@/lib/format";
import { Button, Modal } from "./ui";

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between py-1.5 ${strong ? "font-bold border-t border-line mt-1 pt-2" : ""}`}>
      <span>{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}

export default function PayslipModal({ slip, companyName, onClose }) {
  if (!slip) return null;
  const deductions = slip.lop_deduction + (slip.late_deduction || 0) + (slip.other_deductions || 0);
  return (
    <Modal
      open
      onClose={onClose}
      title={`Payslip, ${monthLabel(slip.month)}`}
      width="max-w-2xl"
      footer={
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print or save as PDF
        </Button>
      }
    >
      <div className="print-area theme-light rounded-panel bg-surface text-ink p-4 sm:p-6 text-sm" id="payslip">
        <div className="flex justify-between items-start border-b border-line pb-4">
          <div>
            <div className="text-lg font-extrabold">{companyName || "Company"}</div>
            <div className="text-ink-muted">Salary slip for {monthLabel(slip.month)}</div>
          </div>
          <div className="text-right text-ink-muted">
            <div>Status: <span className="font-semibold text-ink">{slip.status === "paid" ? "Paid" : "Draft"}</span></div>
            {slip.paid_at && <div>Paid on {fmtDate(slip.paid_at)}</div>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 py-4 border-b border-line">
          <Row label="Employee" value={slip.name} />
          <Row label="Employee code" value={slip.employee_code || "—"} />
          <Row label="Designation" value={slip.designation || "—"} />
          <Row label="Department" value={slip.department || "—"} />
          <Row label="Bank account" value={slip.bank_account || "—"} />
          <Row label="PAN" value={slip.pan || "—"} />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 py-4 border-b border-line text-center">
          {[
            ["Working days", slip.working_days],
            ["Payable days", slip.payable_days],
            ["Loss of pay days", slip.lop_days],
          ].map(([l, v]) => (
            <div key={l} className="rounded-md bg-mist py-2">
              <div className="text-xs text-ink-muted">{l}</div>
              <div className="num text-lg font-bold">{v}</div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 py-4">
          <div>
            <h3 className="font-bold mb-1">Earnings</h3>
            <Row label="Basic" value={money(slip.earnings?.basic)} />
            <Row label="House rent allowance" value={money(slip.earnings?.hra)} />
            <Row label="Special allowance" value={money(slip.earnings?.special_allowance)} />
            {slip.bonus > 0 && <Row label="Bonus" value={money(slip.bonus)} />}
            <Row label="Total earnings" value={money(slip.gross + (slip.bonus || 0))} strong />
          </div>
          <div>
            <h3 className="font-bold mb-1">Deductions</h3>
            <Row label={`Loss of pay (${slip.lop_days} days)`} value={money(slip.lop_deduction)} />
            {slip.late_deduction > 0 && (
              <Row label={`Late coming (${slip.late_count} days, ${slip.late_minutes} min)`} value={money(slip.late_deduction)} />
            )}
            <Row label="Other deductions" value={money(slip.other_deductions)} />
            <Row label="Total deductions" value={money(deductions)} strong />
          </div>
        </div>

        <div className="flex justify-between items-center rounded-md bg-ink text-white px-4 py-3">
          <span className="font-semibold">Net pay</span>
          <span className="num text-xl font-extrabold">{money(slip.net_pay)}</span>
        </div>
        {slip.remarks && <p className="mt-3 text-ink-muted">Note: {slip.remarks}</p>}
        <p className="mt-4 text-xs text-ink-muted">
          Attendance: {slip.present_days} present, {slip.half_days} half days, {slip.paid_leave_days} paid leave, {slip.absent_days} absent,{" "}
          {slip.unpaid_leave_days} unpaid leave. This is a system-generated payslip.
        </p>
      </div>
    </Modal>
  );
}
