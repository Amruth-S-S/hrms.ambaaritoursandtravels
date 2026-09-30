"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { Button, Empty, ErrorNote, Input, Modal, PageHeader, Spinner, TableWrap, Textarea } from "@/components/ui";

export default function DepartmentsPage() {
  const { data, loading, error, reload } = useFetch("/departments");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { name: editing.name, description: editing.description || null };
      await api(editing.id ? `/departments/${editing.id}` : "/departments", { method: editing.id ? "PUT" : "POST", body });
      toast.success(editing.id ? "Department updated" : "Department added");
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete ${d.name}? ${d.employee_count} employee(s) will have no department.`)) return;
    try {
      await api(`/departments/${d.id}`, { method: "DELETE" });
      toast.success("Department deleted");
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Departments"
        actions={<Button onClick={() => setEditing({ name: "", description: "" })}><Plus className="h-4 w-4" /> Add department</Button>}
      />
      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="No departments yet">Group employees by team to filter attendance and reports.</Empty>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Name</th><th>Description</th><th className="text-right">Employees</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id}>
                  <td className="font-semibold">{d.name}</td>
                  <td className="text-ink-muted">{d.description || "—"}</td>
                  <td className="num text-right">{d.employee_count}</td>
                  <td className="whitespace-nowrap text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(d)} aria-label={`Edit ${d.name}`}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(d)} aria-label={`Delete ${d.name}`}><Trash2 className="h-4 w-4 text-brick" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
      {editing && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={editing.id ? "Edit department" : "Add department"}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" form="dept-form" loading={saving}>Save department</Button>
            </>
          }
        >
          <form id="dept-form" onSubmit={save} className="space-y-4">
            <Input label="Name" required minLength={2} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Textarea label="Description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </form>
        </Modal>
      )}
    </>
  );
}
