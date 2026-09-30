const LOCALE = "en-IN";
const pad = (n) => String(n).padStart(2, "0");

function toDate(v) {
  if (!v) return null;
  if (typeof v === "string" && v.length === 10) return new Date(`${v}T00:00:00`);
  return new Date(v);
}

export function fmtTime(v) {
  const d = toDate(v);
  if (!d) return "—";
  return d.toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit", hour12: true });
}

export function fmtDate(v, opts = { day: "numeric", month: "short", year: "numeric" }) {
  const d = toDate(v);
  if (!d) return "—";
  return d.toLocaleDateString(LOCALE, opts);
}

export function fmtDay(v) {
  return fmtDate(v, { weekday: "short", day: "numeric", month: "short" });
}

export function fmtDateTime(v) {
  if (!v) return "—";
  return `${fmtDate(v)}, ${fmtTime(v)}`;
}

export function fmtDuration(min) {
  if (min === null || min === undefined) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function money(n) {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);
}

export function monthNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function monthLabel(m) {
  if (!m) return "";
  const [y, mm] = m.split("-").map(Number);
  return new Date(y, mm - 1, 1).toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
}

export function shortAddress(address, parts = 3) {
  if (!address) return null;
  return address.split(",").slice(0, parts).join(",").trim();
}

export const mapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

export const STATUS_LABEL = {
  present: "Present",
  half_day: "Half day",
  absent: "Absent",
  leave: "On leave",
  holiday: "Holiday",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  draft: "Draft",
  paid: "Paid",
  active: "Active",
  inactive: "Inactive",
};

export const LEAVE_LABEL = { casual: "Casual", sick: "Sick", earned: "Earned", unpaid: "Unpaid" };

export const LOGOUT_REASON = {
  manual: "Logged out",
  idle: "Idle timeout",
  expired: "Token expired",
  auto_closed: "Closed (inactive)",
  ended_by_admin: "Ended by admin",
};
