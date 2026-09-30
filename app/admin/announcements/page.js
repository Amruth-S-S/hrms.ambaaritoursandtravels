"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { fmtDateTime } from "@/lib/format";
import { Badge, Button, Empty, ErrorNote, Input, PageHeader, Select, Spinner, Textarea } from "@/components/ui";

export default function AnnouncementsPage() {
  const { data, loading, error, reload } = useFetch("/announcements");
  const [form, setForm] = useState({ title: "", body: "", priority: "normal" });
  const [saving, setSaving] = useState(false);

  const post = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/announcements", { method: "POST", body: form });
      toast.success("Announcement posted");
      setForm({ title: "", body: "", priority: "normal" });
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api(`/announcements/${a.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Announcements" subtitle="Posts appear on every employee's home screen." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start">
        <form onSubmit={post} className="panel p-5 space-y-4">
          <h2 className="font-bold">New announcement</h2>
          <Input label="Title" required minLength={2} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Message" required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
          </Select>
          <Button type="submit" loading={saving} className="w-full">Post announcement</Button>
        </form>

        <div className="space-y-3">
          <ErrorNote message={error} onRetry={reload} />
          {loading && !data ? (
            <Spinner />
          ) : !data?.length ? (
            <div className="panel"><Empty title="Nothing posted yet" /></div>
          ) : (
            data.map((a) => (
              <article key={a.id} className={`panel p-5 ${a.priority === "important" ? "border-l-4 border-l-marigold" : ""}`}>
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{a.title}</h3>
                    <p className="text-xs text-ink-muted mt-0.5">{a.author}, {fmtDateTime(a.created_at)}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    {a.priority === "important" && <Badge tone="amber">Important</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => remove(a)} aria-label="Delete announcement"><Trash2 className="h-4 w-4 text-brick" /></Button>
                  </div>
                </div>
                <p className="mt-3 text-sm whitespace-pre-line">{a.body}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </>
  );
}
