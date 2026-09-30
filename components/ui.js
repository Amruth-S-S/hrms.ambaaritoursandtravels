"use client";

import { useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import { STATUS_LABEL } from "@/lib/format";

export function Button({ variant = "primary", size, loading, className = "", children, ...props }) {
  return (
    <button
      className={`btn btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Field({ label, hint, error, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-brick">{error}</span>}
    </label>
  );
}

export function Input({ label, hint, className = "", ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input className="input" {...props} />
    </Field>
  );
}

export function Select({ label, hint, className = "", children, ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select className="input" {...props}>
        {children}
      </select>
    </Field>
  );
}

export function Textarea({ label, hint, className = "", rows = 3, ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea className="input" rows={rows} {...props} />
    </Field>
  );
}

export function Modal({ open, onClose, title, children, footer, width = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} max-h-[92dvh] flex flex-col bg-surface border border-line sm:rounded-panel rounded-t-panel shadow-2xl shadow-navy/20`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-base font-bold">{title}</h2>
          <button className="btn btn-ghost h-8 w-8 p-0" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-surface-raised sm:rounded-b-panel pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>
  );
}

const TONES = {
  green: "bg-pine-light text-pine-dark",
  amber: "bg-marigold-light text-marigold",
  brand: "bg-brand-light text-brand",
  red: "bg-brick-light text-brick",
  gray: "bg-mist text-ink-muted",
  ink: "bg-brand text-brand-on",
};

export function Badge({ tone = "gray", children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

const STATUS_TONE = {
  present: "green", approved: "green", paid: "green", active: "green",
  half_day: "amber", pending: "amber", draft: "amber", leave: "amber",
  absent: "red", rejected: "red", inactive: "red",
  holiday: "gray", cancelled: "gray",
};

export function StatusBadge({ status }) {
  if (!status) return null;
  return <Badge tone={STATUS_TONE[status] || "gray"}>{STATUS_LABEL[status] || status}</Badge>;
}

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-ink-muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {label}…
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand" aria-label="Loading" />
    </div>
  );
}

export function Empty({ title, children, action }) {
  return (
    <div className="py-12 px-6 text-center">
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-1 text-sm text-ink-muted max-w-sm mx-auto">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorNote({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="panel border-brick/30 bg-brick-light px-4 py-3 text-sm text-brick flex items-center justify-between gap-3">
      <span>{message}</span>
      {onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
        <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-brand to-transparent" aria-hidden />
        {subtitle && <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone }) {
  const color = tone === "red" ? "text-brick" : tone === "amber" ? "text-marigold" : tone === "green" ? "text-pine" : "text-ink";
  return (
    <div className="panel relative overflow-hidden px-4 py-3.5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" aria-hidden />
      <div className="text-xs sm:text-sm text-ink-muted">{label}</div>
      <div className={`mt-1 text-2xl font-bold num ${color}`}>{value}</div>
      {hint && <div className="text-xs text-ink-muted mt-0.5">{hint}</div>}
    </div>
  );
}

/** Copy each column heading onto its cells as data-label, so phones can show rows as labelled cards. */
function labelCells(root) {
  root.querySelectorAll("table.tbl").forEach((table) => {
    const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    table.querySelectorAll("tbody tr").forEach((tr) => {
      [...tr.children].forEach((td, i) => {
        const label = td.colSpan > 1 ? "" : heads[i] || "";
        if (td.getAttribute("data-label") !== label) td.setAttribute("data-label", label);
      });
    });
  });
}

export function TableWrap({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    labelCells(root);
    const observer = new MutationObserver(() => labelCells(root));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="panel overflow-hidden">
      {/* relative: keeps absolutely positioned bits (sr-only labels) inside the scroll box */}
      <div ref={ref} className="tbl-wrap relative overflow-x-auto">{children}</div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-line bg-surface p-1 gap-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`px-3 h-8 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${
            value === t.value ? "bg-brand text-brand-on" : "text-ink-muted hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
