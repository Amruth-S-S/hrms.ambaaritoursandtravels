"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { fmtDate, fmtDateTime, money, WEEKDAYS, weekOffLabel } from "@/lib/format";
import {
  Button, Empty, ErrorNote, Input, Modal, PageHeader, Select, Spinner, StatusBadge, TableWrap, Textarea,
} from "@/components/ui";

const EMPTY = {
  name: "", email: "", password: "", phone: "", employee_code: "", department_id: "", designation: "",
  date_of_joining: "", date_of_birth: "", gender: "", address: "", emergency_contact: "", salary: "",
  role: "employee", status: "active", shift_start: "", shift_end: "", week_off_day: "", week_off_date: "", bank_account: "", ifsc: "", pan: "",
};

function EmployeeForm({ initial, departments, onClose, onSaved }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(() => {
    const base = { ...EMPTY };
    if (initial) Object.keys(EMPTY).forEach((k) => (base[k] = initial[k] ?? ""));
    base.password = "";
    return base;
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const body = { ...form, salary: form.salary === "" ? 0 : Number(form.salary) };
    Object.keys(body).forEach((k) => body[k] === "" && (body[k] = null));
    if (editing && !body.password) delete body.password;
    setSaving(true);
    try {
      const saved = await api(editing ? `/users/${initial.id}` : "/users", { method: editing ? "PUT" : "POST", body });
      toast.success(editing ? "Employee updated" : `Employee created (${saved.employee_code})`);
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
      title={editing ? `Edit ${initial.name}` : "Add employee"}
      width="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="emp-form" loading={saving}>{editing ? "Save changes" : "Create employee"}</Button>
        </>
      }
    >
      <form id="emp-form" onSubmit={submit} className="space-y-6">
        <fieldset>
          <legend className="font-semibold mb-3">Login</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" required value={form.name} onChange={set("name")} />
            <Input label="Email" type="email" required value={form.email} onChange={set("email")} />
            <Input
              label={editing ? "New password" : "Password"}
              type="text"
              required={!editing}
              minLength={6}
              value={form.password}
              onChange={set("password")}
              hint={editing ? "Leave blank to keep the current password" : "At least 6 characters. Share it with the employee."}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Role" value={form.role} onChange={set("role")}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </Select>
              <Select label="Status" value={form.status} onChange={set("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-semibold mb-3">Job</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Employee code" value={form.employee_code} onChange={set("employee_code")} hint={editing ? undefined : "Leave blank to auto-generate"} />
            <Select label="Department" value={form.department_id} onChange={set("department_id")}>
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Input label="Designation" value={form.designation} onChange={set("designation")} />
            <Input label="Date of joining" type="date" value={form.date_of_joining} onChange={set("date_of_joining")} />
            <Input label="Monthly salary (₹)" type="number" min="0" step="0.01" value={form.salary} onChange={set("salary")} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Shift start" type="time" value={form.shift_start} onChange={set("shift_start")} />
              <Input label="Shift end" type="time" value={form.shift_end} onChange={set("shift_end")} />
            </div>
          </div>
          <p className="text-xs text-ink-muted mt-2">Leave shift times blank to use the company office hours.</p>
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <Select label="Week off day" value={form.week_off_day} onChange={set("week_off_day")}>
              <option value="">No weekly off</option>
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </Select>
            <Input
              label="Week off date"
              type="date"
              value={form.week_off_date}
              onChange={set("week_off_date")}
              hint="One extra day off on a specific date, e.g. a swapped week off"
            />
          </div>
          <p className="text-xs text-ink-muted mt-2">
            The company works every day. These days off are not counted as absent and need no leave.
          </p>
        </fieldset>

        <fieldset>
          <legend className="font-semibold mb-3">Personal</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Phone" value={form.phone} onChange={set("phone")} />
            <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
            <Select label="Gender" value={form.gender} onChange={set("gender")}>
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Emergency contact" value={form.emergency_contact} onChange={set("emergency_contact")} />
            <Textarea className="sm:col-span-2" label="Address" rows={2} value={form.address} onChange={set("address")} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-semibold mb-3">Bank and tax</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Bank account" value={form.bank_account} onChange={set("bank_account")} />
            <Input label="IFSC" value={form.ifsc} onChange={set("ifsc")} />
            <Input label="PAN" value={form.pan} onChange={set("pan")} />
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

export default function EmployeesPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const { data: users, loading, error, reload } = useFetch("/users", { q, department_id: dept, status });
  const { data: departments } = useFetch("/departments");

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? Their attendance history is kept. To keep the account, set it to Inactive instead.`)) return;
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      toast.success("Employee deleted");
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Create logins, set salaries and manage who can mark attendance."
        actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add employee</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" aria-hidden />
          <input className="input pl-9" placeholder="Search by name, email or code" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search employees" />
        </div>
        <select className="input sm:w-48" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
          <option value="">All departments</option>
          {(departments || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input sm:w-36" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !users ? (
          <Spinner />
        ) : !users?.length ? (
          <Empty
            title={q ? "No employees match your search" : "No employees yet"}
            action={!q && <Button onClick={() => setEditing({})}>Add your first employee</Button>}
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Joined</th>
                <th className="text-right">Salary</th>
                <th>Last login</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="font-semibold">
                      {u.name}
                      {u.role === "admin" && <span className="text-xs text-brand font-semibold ml-2">Admin</span>}
                    </div>
                    <div className="text-xs text-ink-muted">{u.employee_code}, {u.email}</div>
                  </td>
                  <td>
                    <div>{u.department_name || "—"}</div>
                    <div className="text-xs text-ink-muted">{u.designation}</div>
                    {(u.week_off_day != null || u.week_off_date) && (
                      <div className="text-xs text-ink-muted">Week off: {weekOffLabel(u)}</div>
                    )}
                  </td>
                  <td className="num whitespace-nowrap">{fmtDate(u.date_of_joining)}</td>
                  <td className="num text-right whitespace-nowrap">{money(u.salary)}</td>
                  <td className="num text-xs whitespace-nowrap">{fmtDateTime(u.last_login_at)}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td className="whitespace-nowrap text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(u)} aria-label={`Delete ${u.name}`}>
                      <Trash2 className="h-4 w-4 text-brick" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {editing && (
        <EmployeeForm
          initial={editing.id ? editing : null}
          departments={departments || []}
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
