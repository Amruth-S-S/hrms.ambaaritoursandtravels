"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { fmtDate, LEAVE_LABEL, todayISO } from "@/lib/format";
import { Button, Empty, ErrorNote, Input, Modal, PageHeader, Select, Spinner, StatusBadge, TableWrap, Textarea } from "@/components/ui";

function ApplyModal({ onClose, onDone }) {
  const [form, setForm] = useState({ leave_type: "casual", start_date: todayISO(), end_date: todayISO(), half_day: false, reason: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api("/leaves", { method: "POST", body: form });
      toast.success(`Leave requested for ${res.days} day(s)`);
      onDone();
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
      title="Apply for leave"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="leave-form" loading={saving}>Send request</Button>
        </>
      }
    >
      <form id="leave-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Select label="Leave type" value={form.leave_type} onChange={set("leave_type")} className="sm:col-span-2">
          {Object.entries(LEAVE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="From" type="date" required value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value, end_date: f.end_date < e.target.value ? e.target.value : f.end_date }))} />
        <Input label="To" type="date" required min={form.start_date} value={form.end_date} onChange={set("end_date")} disabled={form.half_day} />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" className="h-4 w-4 accent-[#1D5FD6]" checked={form.half_day} onChange={(e) => setForm((f) => ({ ...f, half_day: e.target.checked, end_date: f.start_date }))} />
          Half day only
        </label>
        <Textarea label="Reason" required minLength={3} className="sm:col-span-2" value={form.reason} onChange={set("reason")} />
      </form>
      <p className="mt-3 text-xs text-ink-muted">Your week off days inside the range are not counted.</p>
    </Modal>
  );
}

export default function MyLeaves() {
  const [applying, setApplying] = useState(false);
  const { data: leaves, loading, error, reload } = useFetch("/leaves/me");
  const { data: balance, reload: reloadBalance } = useFetch("/leaves/balance");

  const cancel = async (lv) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      await api(`/leaves/${lv.id}`, { method: "DELETE" });
      toast.success("Request cancelled");
      reload();
      reloadBalance();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Leave" actions={<Button onClick={() => setApplying(true)}><Plus className="h-4 w-4" /> Apply for leave</Button>} />

      {balance && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {["casual", "sick", "earned", "unpaid"].map((t) => (
            <div key={t} className="panel px-4 py-3">
              <div className="text-sm text-ink-muted">{LEAVE_LABEL[t]}</div>
              {t === "unpaid" ? (
                <div className="mt-1 text-2xl font-bold num">{balance[t].used} <span className="text-sm font-normal text-ink-muted">taken</span></div>
              ) : (
                <div className="mt-1 text-2xl font-bold num">
                  {balance[t].remaining}
                  <span className="text-sm font-normal text-ink-muted"> of {balance[t].quota} left</span>
                </div>
              )}
              {balance[t].pending > 0 && <div className="text-xs text-marigold">{balance[t].pending} pending</div>}
            </div>
          ))}
        </div>
      )}

      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !leaves ? (
          <Spinner />
        ) : !leaves?.length ? (
          <Empty title="You haven't requested any leave" action={<Button onClick={() => setApplying(true)}>Apply for leave</Button>} />
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Type</th><th>Dates</th><th className="text-right">Days</th><th>Reason</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {leaves.map((lv) => (
                <tr key={lv.id}>
                  <td className="font-semibold">{LEAVE_LABEL[lv.leave_type]}</td>
                  <td className="num whitespace-nowrap">
                    {fmtDate(lv.start_date)}
                    {lv.end_date !== lv.start_date && <> – {fmtDate(lv.end_date)}</>}
                  </td>
                  <td className="num text-right">{lv.days}</td>
                  <td className="max-w-[280px]">
                    {lv.reason}
                    {lv.remarks && <div className="text-xs text-ink-muted mt-1">Admin: {lv.remarks}</div>}
                  </td>
                  <td><StatusBadge status={lv.status} /></td>
                  <td>{lv.status === "pending" && <Button size="sm" variant="ghost" onClick={() => cancel(lv)}>Cancel</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {applying && (
        <ApplyModal
          onClose={() => setApplying(false)}
          onDone={() => {
            setApplying(false);
            reload();
            reloadBalance();
          }}
        />
      )}
    </>
  );
}
