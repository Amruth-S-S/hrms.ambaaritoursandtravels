"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { fmtDate, fmtDateTime, LEAVE_LABEL } from "@/lib/format";
import { Button, Empty, ErrorNote, Modal, PageHeader, Spinner, StatusBadge, TableWrap, Tabs, Textarea } from "@/components/ui";

function DecisionModal({ leave, decision, onClose, onDone }) {
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const approve = decision === "approved";

  const submit = async () => {
    setSaving(true);
    try {
      await api(`/leaves/${leave.id}/decision`, { method: "PUT", body: { status: decision, remarks: remarks || null } });
      toast.success(approve ? "Leave approved" : "Leave rejected");
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={approve ? "Approve leave" : "Reject leave"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={approve ? "primary" : "danger"} onClick={submit} loading={saving}>
            {approve ? "Approve leave" : "Reject leave"}
          </Button>
        </>
      }
    >
      <p className="text-sm">
        <span className="font-semibold">{leave.employee.name}</span> asked for {leave.days} day(s) of {LEAVE_LABEL[leave.leave_type].toLowerCase()} leave,{" "}
        {fmtDate(leave.start_date)}{leave.end_date !== leave.start_date && ` to ${fmtDate(leave.end_date)}`}.
      </p>
      <p className="mt-2 text-sm text-ink-muted">Reason: {leave.reason}</p>
      <Textarea className="mt-4" label="Remarks for the employee (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
    </Modal>
  );
}

export default function LeavesPage() {
  const [status, setStatus] = useState("pending");
  const [action, setAction] = useState(null);
  const { data, loading, error, reload } = useFetch("/leaves", { status: status === "all" ? "" : status });

  return (
    <>
      <PageHeader
        title="Leave requests"
        subtitle="Approve or reject time off. Approved leave is excluded from absences and payroll deductions."
        actions={
          <Tabs
            value={status}
            onChange={setStatus}
            tabs={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "all", label: "All" },
            ]}
          />
        }
      />
      <ErrorNote message={error} onRetry={reload} />
      <TableWrap>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title={status === "pending" ? "No requests waiting for you" : "No leave requests here"} />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th className="text-right">Days</th>
                <th>Reason</th>
                <th>Applied</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.map((lv) => (
                <tr key={lv.id}>
                  <td>
                    <div className="font-semibold">{lv.employee.name}</div>
                    <div className="text-xs text-ink-muted">{lv.employee.employee_code}</div>
                  </td>
                  <td>{LEAVE_LABEL[lv.leave_type]}{lv.half_day && " (half day)"}</td>
                  <td className="num whitespace-nowrap">
                    {fmtDate(lv.start_date)}
                    {lv.end_date !== lv.start_date && <> – {fmtDate(lv.end_date)}</>}
                  </td>
                  <td className="num text-right">{lv.days}</td>
                  <td className="max-w-[260px]">
                    {lv.reason}
                    {lv.remarks && <div className="text-xs text-ink-muted mt-1">Admin: {lv.remarks}</div>}
                  </td>
                  <td className="num text-xs whitespace-nowrap">{fmtDateTime(lv.applied_at)}</td>
                  <td><StatusBadge status={lv.status} /></td>
                  <td className="whitespace-nowrap">
                    {lv.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => setAction({ leave: lv, decision: "approved" })}>Approve</Button>
                        <Button size="sm" variant="secondary" onClick={() => setAction({ leave: lv, decision: "rejected" })}>Reject</Button>
                      </div>
                    )}
                    {lv.status === "approved" && (
                      <Button size="sm" variant="ghost" onClick={() => setAction({ leave: lv, decision: "rejected" })}>Revoke</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
      {action && (
        <DecisionModal
          {...action}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            reload();
          }}
        />
      )}
    </>
  );
}
