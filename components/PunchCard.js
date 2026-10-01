"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LocateFixed, LogIn, LogOut, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { fmtDuration, fmtTime, mapsUrl, shortAddress } from "@/lib/format";
import CameraCapture from "./CameraCapture";
import { Badge, Button, Modal, Spinner, StatusBadge, Textarea } from "./ui";

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("This browser cannot share location."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) =>
        reject(
          new Error(
            e.code === 1
              ? "Location permission was denied. Allow location access for this site and try again."
              : "Could not get your location. Move to an open area and try again."
          )
        ),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
}

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Day line from shift start to shift end, with markers for check-in, now and check-out. */
function DayLine({ rules, record, now }) {
  const start = toMin(rules.office_start);
  const end = toMin(rules.office_end);
  const span = Math.max(1, end - start);
  const pos = (date) => {
    const d = new Date(date);
    const m = d.getHours() * 60 + d.getMinutes();
    return Math.min(100, Math.max(0, ((m - start) / span) * 100));
  };
  const ci = record?.check_in?.time;
  const co = record?.check_out?.time;
  return (
    <div className="mt-6">
      <div className="relative h-2 rounded-full bg-mist">
        {ci && (
          <div
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-brand to-brand-dark"
            style={{ left: `${pos(ci)}%`, width: `${Math.max(1, pos(co || now) - pos(ci))}%` }}
          />
        )}
        {!co && <div className="absolute -top-1 h-4 w-0.5 bg-ink" style={{ left: `${pos(now)}%` }} aria-hidden />}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-muted num">
        <span>Shift starts {rules.office_start}</span>
        <span>Ends {rules.office_end}</span>
      </div>
    </div>
  );
}

function PunchModal({ mode, rules, record, onClose, onDone }) {
  const [photo, setPhoto] = useState(null);
  const [loc, setLoc] = useState(null);
  const [locError, setLocError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const locate = useCallback(async () => {
    setLocating(true);
    setLocError(null);
    try {
      setLoc(await getPosition());
    } catch (e) {
      setLocError(e.message);
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const submit = async () => {
    if (!loc) return toast.error("Location is required to mark attendance.");
    if (rules.require_selfie && !photo) return toast.error("Take a selfie first.");
    if (mode === "out" && record?.check_in?.time) {
      const worked = (Date.now() - new Date(record.check_in.time).getTime()) / 60000;
      if (worked < 240 && !window.confirm(`You have worked ${fmtDuration(worked)} today. Check out anyway?`)) return;
    }
    const form = new FormData();
    form.append("latitude", String(loc.latitude));
    form.append("longitude", String(loc.longitude));
    form.append("accuracy", String(loc.accuracy ?? ""));
    if (note.trim()) form.append("note", note.trim());
    if (photo) form.append("selfie", photo, "selfie.jpg");
    setSaving(true);
    try {
      const rec = await api(mode === "in" ? "/attendance/check-in" : "/attendance/check-out", { method: "POST", form });
      toast.success(mode === "in" ? "Checked in" : "Checked out");
      onDone(rec);
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
      title={mode === "in" ? "Check in" : "Check out"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving} disabled={!loc || (rules.require_selfie && !photo)}>
            {mode === "in" ? "Check in now" : "Check out now"}
          </Button>
        </>
      }
    >
      <CameraCapture onChange={setPhoto} />
      <div className="mt-5 rounded-md border border-line p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand" aria-hidden /> Your location
          </span>
          <Button size="sm" variant="ghost" onClick={locate} loading={locating}>
            <LocateFixed className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
        {locating && !loc && <p className="mt-1 text-ink-muted">Finding your location…</p>}
        {locError && <p className="mt-1 text-brick">{locError}</p>}
        {loc && (
          <p className="mt-1 text-ink-muted num">
            <a className="text-brand hover:underline" href={mapsUrl(loc.latitude, loc.longitude)} target="_blank" rel="noreferrer">
              {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
            </a>
            , accurate to about {Math.round(loc.accuracy)} m
          </p>
        )}
        {rules.enforce_geofence && (
          <p className="mt-1 text-xs text-ink-muted">You must be within {rules.office_radius_m} m of the office.</p>
        )}
      </div>
      <Textarea className="mt-4" label="Note (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Working from client site today" />
      <p className="mt-3 text-xs text-ink-muted">The time is recorded by the server when you submit.</p>
    </Modal>
  );
}

export default function PunchCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    try {
      setData(await api("/attendance/today"));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [load]);

  if (error) return <div className="panel p-6 text-sm text-brick">{error}</div>;
  if (!data) return <div className="panel"><Spinner /></div>;

  const { record, rules } = data;
  const ci = record?.check_in;
  const co = record?.check_out;
  const workedMin = ci ? (co ? record.work_minutes : Math.floor((now - new Date(ci.time)) / 60000)) : 0;

  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-ink-muted">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            {!rules.is_working_day && " (your week off)"}
          </p>
          <p className="num text-5xl sm:text-6xl font-extrabold tracking-tight mt-1" aria-live="off">
            {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
            <span className="text-2xl text-ink-muted ml-1">{String(now.getSeconds()).padStart(2, "0")}</span>
          </p>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-2">
          {!ci && (
            <Button className="h-12 px-6 text-base w-full md:w-auto" onClick={() => setMode("in")}>
              <LogIn className="h-5 w-5" /> Check in
            </Button>
          )}
          {ci && !co && (
            <Button variant="secondary" className="h-12 px-6 text-base w-full md:w-auto" onClick={() => setMode("out")}>
              <LogOut className="h-5 w-5" /> Check out
            </Button>
          )}
          {ci && co && <StatusBadge status={record.status} />}
          <p className="text-sm text-ink-muted">
            {!ci && "You haven't checked in today."}
            {ci && !co && <>Working for <span className="num font-semibold text-ink">{fmtDuration(workedMin)}</span></>}
            {ci && co && <>Worked <span className="num font-semibold text-ink">{fmtDuration(workedMin)}</span> today</>}
          </p>
        </div>
      </div>

      <DayLine rules={rules} record={record} now={now} />

      {ci && (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-line pt-5 text-sm">
          <div>
            <dt className="text-ink-muted">Checked in</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="num text-lg font-bold">{fmtTime(ci.time)}</span>
              {record.is_late && <Badge tone="amber">Late by {fmtDuration(record.late_minutes)}</Badge>}
            </dd>
            <dd className="text-xs text-ink-muted mt-0.5">{shortAddress(ci.address) || "Location saved"}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Checked out</dt>
            <dd className="mt-0.5 num text-lg font-bold">{co ? fmtTime(co.time) : "—"}</dd>
            {co && <dd className="text-xs text-ink-muted mt-0.5">{shortAddress(co.address) || "Location saved"}</dd>}
          </div>
        </dl>
      )}

      {mode && (
        <PunchModal
          mode={mode}
          rules={rules}
          record={record}
          onClose={() => setMode(null)}
          onDone={() => {
            setMode(null);
            load();
          }}
        />
      )}
    </section>
  );
}
