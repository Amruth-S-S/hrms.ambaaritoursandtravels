"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LocateFixed } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { mapsUrl } from "@/lib/format";
import { Button, ErrorNote, Input, PageHeader, Spinner } from "@/components/ui";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-[#1D5FD6]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const { data, loading, error, reload } = useFetch("/settings");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (data) setForm({ ...data, office_lat: data.office_lat ?? "", office_lng: data.office_lng ?? "" });
  }, [data]);

  if (loading && !form) return <Spinner />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;
  if (!form) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setQuota = (k) => (e) => setForm((f) => ({ ...f, leave_quota: { ...f.leave_quota, [k]: e.target.value } }));
  const toggleDay = (i) =>
    setForm((f) => ({
      ...f,
      working_days: f.working_days.includes(i) ? f.working_days.filter((d) => d !== i) : [...f.working_days, i].sort(),
    }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("This browser cannot share location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setForm((f) => ({ ...f, office_lat: p.coords.latitude.toFixed(6), office_lng: p.coords.longitude.toFixed(6) }));
        setLocating(false);
        toast.success("Office location set to where you are now");
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location. Allow location access and try again.");
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  };

  const save = async (e) => {
    e.preventDefault();
    const hasLocation = form.office_lat !== "" && form.office_lng !== "";
    if (form.enforce_geofence && !hasLocation) return toast.error("Set the office location before requiring employees to be there.");
    setSaving(true);
    try {
      const body = {
        company_name: form.company_name,
        office_start: form.office_start,
        office_end: form.office_end,
        grace_minutes: Number(form.grace_minutes),
        half_day_hours: Number(form.half_day_hours),
        full_day_hours: Number(form.full_day_hours),
        working_days: form.working_days,
        office_lat: hasLocation ? Number(form.office_lat) : null,
        office_lng: hasLocation ? Number(form.office_lng) : null,
        office_radius_m: Number(form.office_radius_m),
        enforce_geofence: form.enforce_geofence,
        require_selfie: form.require_selfie,
        leave_quota: {
          casual: Number(form.leave_quota.casual),
          sick: Number(form.leave_quota.sick),
          earned: Number(form.leave_quota.earned),
        },
      };
      await api("/settings", { method: "PUT", body });
      toast.success("Settings saved");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader title="Settings" subtitle="Office hours, attendance rules and leave allowances." actions={<Button type="submit" loading={saving}>Save settings</Button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5 space-y-4">
          <h2 className="font-bold">Company and hours</h2>
          <Input label="Company name" required value={form.company_name} onChange={set("company_name")} hint="Shown on payslips" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Office starts" type="time" required value={form.office_start} onChange={set("office_start")} />
            <Input label="Office ends" type="time" required value={form.office_end} onChange={set("office_end")} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Grace (minutes)" type="number" min="0" value={form.grace_minutes} onChange={set("grace_minutes")} hint="Before marked late" />
            <Input label="Half day (hours)" type="number" min="0" step="0.5" value={form.half_day_hours} onChange={set("half_day_hours")} />
            <Input label="Full day (hours)" type="number" min="0" step="0.5" value={form.full_day_hours} onChange={set("full_day_hours")} />
          </div>
          <div>
            <span className="field-label">Working days</span>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d, i) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(i)}
                  aria-pressed={form.working_days.includes(i)}
                  className={`h-9 w-12 rounded-md text-sm font-semibold border ${
                    form.working_days.includes(i) ? "bg-brand text-brand-on border-brand" : "bg-surface text-ink-muted border-line"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel p-5 space-y-4">
          <h2 className="font-bold">Check-in rules</h2>
          <Toggle label="Require a selfie" hint="Employees must take a photo to check in and out." checked={form.require_selfie} onChange={(v) => setForm({ ...form, require_selfie: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Office latitude" type="number" step="any" value={form.office_lat} onChange={set("office_lat")} />
            <Input label="Office longitude" type="number" step="any" value={form.office_lng} onChange={set("office_lng")} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={useMyLocation} loading={locating}>
              <LocateFixed className="h-4 w-4" /> Use my current location
            </Button>
            {form.office_lat !== "" && form.office_lng !== "" && (
              <a className="text-sm text-brand hover:underline" href={mapsUrl(form.office_lat, form.office_lng)} target="_blank" rel="noreferrer">Check on map</a>
            )}
          </div>
          <Input label="Allowed distance from office (metres)" type="number" min="10" value={form.office_radius_m} onChange={set("office_radius_m")} />
          <Toggle
            label="Only allow check-in near the office"
            hint="When off, check-ins from anywhere are accepted and the distance is shown to you."
            checked={form.enforce_geofence}
            onChange={(v) => setForm({ ...form, enforce_geofence: v })}
          />
        </section>

        <section className="panel p-5 space-y-4">
          <h2 className="font-bold">Yearly leave allowance</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Casual" type="number" min="0" step="0.5" value={form.leave_quota.casual} onChange={setQuota("casual")} />
            <Input label="Sick" type="number" min="0" step="0.5" value={form.leave_quota.sick} onChange={setQuota("sick")} />
            <Input label="Earned" type="number" min="0" step="0.5" value={form.leave_quota.earned} onChange={setQuota("earned")} />
          </div>
          <p className="text-xs text-ink-muted">Unpaid leave has no limit and is deducted from salary.</p>
        </section>
      </div>
    </form>
  );
}
