"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { fmtDate } from "@/lib/format";
import { Button, Empty, ErrorNote, Input, Modal, PageHeader, Spinner, TableWrap } from "@/components/ui";

export default function HolidaysPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error, reload } = useFetch("/holidays", { year });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/holidays", { method: "POST", body: { ...form, description: form.description || null } });
      toast.success("Holiday added");
      setForm(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (h) => {
    if (!window.confirm(`Remove ${h.name}?`)) return;
    try {
      await api(`/holidays/${h.id}`, { method: "DELETE" });
      toast.success("Holiday removed");
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Holidays"
        subtitle="Holidays are not counted as absences or leave days."
        actions={
          <>
            <select className="input w-28" value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Year">
              {[-1, 0, 1].map((o) => {
                const y = new Date().getFullYear() + o;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <Button onClick={() => setForm({ name: "", date: "", description: "" })}><Plus className="h-4 w-4" /> Add holiday</Button>
          </>
        }
      />
      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title={`No holidays for ${year}`} />
        ) : (
          <table className="tbl">
            <thead><tr><th>Date</th><th>Holiday</th><th>Description</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.map((h) => (
                <tr key={h.id}>
                  <td className="num whitespace-nowrap">{fmtDate(h.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="font-semibold">{h.name}</td>
                  <td className="text-ink-muted">{h.description || "—"}</td>
                  <td className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => remove(h)} aria-label={`Remove ${h.name}`}><Trash2 className="h-4 w-4 text-brick" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
      {form && (
        <Modal
          open
          onClose={() => setForm(null)}
          title="Add holiday"
          footer={
            <>
              <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" form="holiday-form" loading={saving}>Add holiday</Button>
            </>
          }
        >
          <form id="holiday-form" onSubmit={save} className="space-y-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Diwali" />
            <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </form>
        </Modal>
      )}
    </>
  );
}
