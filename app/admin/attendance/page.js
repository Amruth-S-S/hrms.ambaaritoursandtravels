"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Pencil, Plus } from "lucide-react";
import { api, downloadFile } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { fmtDay, fmtDuration, fmtTime, monthLabel, monthNow, todayISO } from "@/lib/format";
import LocationCell from "@/components/LocationCell";
import Selfie from "@/components/Selfie";
import {
  Badge, Button, Empty, ErrorNote, Modal, PageHeader, Select, Input, Spinner, StatusBadge, TableWrap, Tabs, Textarea,
} from "@/components/ui";

const toHHMM = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function MarkModal({ record, employees, defaultDate, onClose, onSaved }) {
  const [form, setForm] = useState({
    user_id: record?.user_id || "",
    date: record?.date || defaultDate,
    status: record?.status || "present",
    check_in_time: toHHMM(record?.check_in?.time),
    check_out_time: toHHMM(record?.check_out?.time),
    remarks: record?.remarks || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/attendance/mark", { method: "POST", body: { ...form, remarks: form.remarks || null } });
      toast.success("Attendance saved");
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
      title={record ? `Correct attendance: ${record.employee.name}` : "Mark attendance"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="mark-form" loading={saving}>Save attendance</Button>
        </>
      }
    >
      <form id="mark-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Select label="Employee" required value={form.user_id} onChange={set("user_id")} disabled={Boolean(record)} className="sm:col-span-2">
          <option value="">Choose an employee</option>
          {employees.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.employee_code})</option>
          ))}
        </Select>
        <Input label="Date" type="date" required max={todayISO()} value={form.date} onChange={set("date")} disabled={Boolean(record)} />
        <Select label="Status" value={form.status} onChange={set("status")}>
          <option value="present">Present</option>
          <option value="half_day">Half day</option>
          <option value="absent">Absent</option>
          <option value="leave">On leave (paid)</option>
          <option value="holiday">Holiday</option>
        </Select>
        <Input label="Check-in time" type="time" value={form.check_in_time} onChange={set("check_in_time")} />
        <Input label="Check-out time" type="time" value={form.check_out_time} onChange={set("check_out_time")} />
        <Textarea className="sm:col-span-2" label="Reason for change" rows={2} value={form.remarks} onChange={set("remarks")} placeholder="e.g. Forgot to check out, confirmed by manager" />
      </form>
    </Modal>
  );
}

function DailyLog({ employees }) {
  const [date, setDate] = useState(todayISO());
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useFetch("/attendance", { date, user_id: userId, status });

  const remove = async (r) => {
    if (!window.confirm(`Delete ${r.employee.name}'s attendance for ${fmtDay(r.date)}?`)) return;
    try {
      await api(`/attendance/${r.id}`, { method: "DELETE" });
      toast.success("Record deleted");
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="date" className="input sm:w-44" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <select className="input sm:w-56" value={userId} onChange={(e) => setUserId(e.target.value)} aria-label="Employee">
          <option value="">All employees</option>
          {employees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="present">Present</option>
          <option value="half_day">Half day</option>
          <option value="absent">Absent</option>
          <option value="leave">On leave</option>
        </select>
        <div className="sm:ml-auto">
          <Button onClick={() => setEditing({ new: true })}><Plus className="h-4 w-4" /> Mark attendance</Button>
        </div>
      </div>

      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title={`No attendance recorded for ${fmtDay(date)}`}>Employees appear here as soon as they check in.</Empty>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check in</th>
                <th>Check-in location</th>
                <th>Check out</th>
                <th>Check-out location</th>
                <th>Hours</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="font-semibold whitespace-nowrap">{r.employee.name}</div>
                    <div className="text-xs text-ink-muted">{r.employee.employee_code}</div>
                    {r.remarks && <div className="text-xs text-ink-muted mt-1 max-w-[180px]">Note: {r.remarks}</div>}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Selfie id={r.check_in?.selfie_id} label={`${r.employee.name} check-in`} />
                      <div>
                        <div className="num font-semibold whitespace-nowrap">{fmtTime(r.check_in?.time)}</div>
                        {r.is_late && <Badge tone="amber">Late {fmtDuration(r.late_minutes)}</Badge>}
                      </div>
                    </div>
                  </td>
                  <td><LocationCell block={r.check_in} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      {r.check_out && <Selfie id={r.check_out?.selfie_id} label={`${r.employee.name} check-out`} />}
                      <div>
                        <div className="num font-semibold whitespace-nowrap">{fmtTime(r.check_out?.time)}</div>
                        {r.early_leave && <Badge tone="amber">Left early</Badge>}
                      </div>
                    </div>
                  </td>
                  <td><LocationCell block={r.check_out} /></td>
                  <td className="num whitespace-nowrap">
                    {r.check_out ? fmtDuration(r.work_minutes) : r.check_in ? <span className="text-ink-muted">Working</span> : "—"}
                    {r.overtime_minutes > 0 && <div className="text-xs text-pine">+{fmtDuration(r.overtime_minutes)} OT</div>}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(r)} aria-label="Correct record"><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r)} className="text-brick">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {editing && (
        <MarkModal
          record={editing.new ? null : editing}
          employees={employees}
          defaultDate={date}
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

function MonthlyReport() {
  const [month, setMonth] = useState(monthNow());
  const [downloading, setDownloading] = useState(false);
  const { data, loading, error, reload } = useFetch("/attendance/report", { month });

  const exportCsv = async () => {
    setDownloading(true);
    try {
      await downloadFile("/attendance/export", { month }, `attendance-${month}.csv`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="month" className="input sm:w-48" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month" />
        <div className="sm:ml-auto">
          <Button variant="secondary" onClick={exportCsv} loading={downloading}><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>
      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.rows?.length ? (
          <Empty title="No active employees" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="text-right">Working days</th>
                <th className="text-right">Present</th>
                <th className="text-right">Half days</th>
                <th className="text-right">Absent</th>
                <th className="text-right">Leave</th>
                <th className="text-right">Late</th>
                <th className="text-right">Hours</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.user_id}>
                  <td>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-ink-muted">{r.employee_code}</div>
                  </td>
                  <td className="num text-right">{r.working_days}</td>
                  <td className="num text-right text-pine font-semibold">{r.present}</td>
                  <td className="num text-right">{r.half_day}</td>
                  <td className={`num text-right ${r.absent ? "text-brick font-semibold" : ""}`}>{r.absent}</td>
                  <td className="num text-right">{r.paid_leave + r.unpaid_leave}</td>
                  <td className={`num text-right ${r.late ? "text-marigold font-semibold" : ""}`}>{r.late}</td>
                  <td className="num text-right">{fmtDuration(r.work_minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
      <p className="mt-3 text-xs text-ink-muted">
        {monthLabel(month)}. Absent counts past working days with no check-in and no approved leave.
      </p>
    </>
  );
}

export default function AttendancePage() {
  const [tab, setTab] = useState("daily");
  const { data: employees } = useFetch("/users", { status: "active" });
  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Check-in selfies, locations and hours for every employee."
        actions={<Tabs value={tab} onChange={setTab} tabs={[{ value: "daily", label: "Daily log" }, { value: "report", label: "Monthly report" }]} />}
      />
      {tab === "daily" ? <DailyLog employees={employees || []} /> : <MonthlyReport />}
    </>
  );
}
