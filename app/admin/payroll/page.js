"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, Pencil, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { money, monthLabel, monthNow } from "@/lib/format";
import PayslipModal from "@/components/Payslip";
import { Button, Empty, ErrorNote, Input, Modal, PageHeader, Select, Spinner, Stat, StatusBadge, TableWrap, Textarea } from "@/components/ui";

function AdjustModal({ slip, onClose, onSaved }) {
  const [form, setForm] = useState({
    bonus: slip.bonus || 0,
    other_deductions: slip.other_deductions || 0,
    status: slip.status,
    remarks: slip.remarks || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api(`/payroll/${slip.id}`, {
        method: "PUT",
        body: { ...form, bonus: Number(form.bonus || 0), other_deductions: Number(form.other_deductions || 0), remarks: form.remarks || null },
      });
      toast.success("Payslip updated");
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Adjust payslip: ${slip.employee.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="adjust-form" loading={saving}>Save payslip</Button>
        </>
      }
    >
      <form id="adjust-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Input label="Bonus (₹)" type="number" min="0" step="0.01" value={form.bonus} onChange={set("bonus")} />
        <Input label="Other deductions (₹)" type="number" min="0" step="0.01" value={form.other_deductions} onChange={set("other_deductions")} hint="PF, TDS, advances" />
        <Select label="Status" value={form.status} onChange={set("status")}>
          <option value="draft">Draft</option>
          <option value="paid">Paid</option>
        </Select>
        <Textarea className="sm:col-span-2" label="Note on payslip" rows={2} value={form.remarks} onChange={set("remarks")} />
      </form>
      <p className="mt-3 text-xs text-ink-muted">Paid payslips are not overwritten when payroll is regenerated.</p>
    </Modal>
  );
}

export default function PayrollPage() {
  const [month, setMonth] = useState(monthNow());
  const [generating, setGenerating] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useFetch("/payroll", { month });
  const { data: company } = useFetch("/settings");

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await api("/payroll/generate", { method: "POST", body: { month } });
      toast.success(res.message);
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const total = (data || []).reduce((s, p) => s + p.net_pay, 0);
  const paid = (data || []).filter((p) => p.status === "paid").length;

  return (
    <>
      <PageHeader
        title="Payroll"
        subtitle="Salary is prorated by attendance. Absences, half days and unpaid leave reduce pay."
        actions={
          <>
            <input type="month" className="input w-44" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month" />
            <Button onClick={generate} loading={generating}>
              <RefreshCw className="h-4 w-4" /> {data?.length ? "Recalculate" : "Generate payroll"}
            </Button>
          </>
        }
      />

      {data?.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <Stat label={`Net payout, ${monthLabel(month)}`} value={money(total)} />
          <Stat label="Payslips" value={data.length} />
          <Stat label="Marked paid" value={`${paid} / ${data.length}`} tone={paid === data.length ? "green" : "amber"} />
        </div>
      )}

      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title={`No payroll for ${monthLabel(month)} yet`} action={<Button onClick={generate} loading={generating}>Generate payroll</Button>}>
            Generating reads each employee&apos;s attendance and leave for the month.
          </Empty>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="text-right">Gross</th>
                <th className="text-right">Payable days</th>
                <th className="text-right">LOP days</th>
                <th className="text-right">Deductions</th>
                <th className="text-right">Bonus</th>
                <th className="text-right">Net pay</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="font-semibold">{p.employee.name}</div>
                    <div className="text-xs text-ink-muted">{p.employee.employee_code}</div>
                  </td>
                  <td className="num text-right">{money(p.gross)}</td>
                  <td className="num text-right">{p.payable_days} / {p.working_days}</td>
                  <td className={`num text-right ${p.lop_days ? "text-brick font-semibold" : ""}`}>{p.lop_days}</td>
                  <td className="num text-right">
                    <div>
                      <div>{money(p.lop_deduction + (p.late_deduction || 0) + (p.other_deductions || 0))}</div>
                      {p.late_deduction > 0 && <div className="text-xs text-brick">incl. {money(p.late_deduction)} late</div>}
                    </div>
                  </td>
                  <td className="num text-right">{money(p.bonus)}</td>
                  <td className="num text-right font-bold">{money(p.net_pay)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => setViewing(p)} aria-label="View payslip"><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)} aria-label="Adjust payslip"><Pencil className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      <PayslipModal slip={viewing} companyName={company?.company_name} onClose={() => setViewing(null)} />
      {editing && (
        <AdjustModal
          slip={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}
