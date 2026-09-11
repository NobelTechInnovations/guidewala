"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaSave } from "react-icons/fa";
import { Card, Field, inputCls } from "@/components/admin/ui";

export default function HotelForm({
  hotelId,
  initial,
}: {
  hotelId?: string;
  initial?: { hotelName: string; cityId: string; isActive: string };
}) {
  const router = useRouter();
  const [hotelName, setHotelName] = useState(initial?.hotelName || "");
  const [cityId, setCityId] = useState(initial?.cityId || "");
  const [isActive, setIsActive] = useState(initial?.isActive || "Y");
  const [cities, setCities] = useState<{ CITY_ID: string; CITY_NAME: string }[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/lookups")
      .then((r) => r.json())
      .then((d) => setCities(d.cities));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!hotelName || !cityId) {
      setError("Hotel Name and City are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(hotelId ? `/api/admin/hotels/${hotelId}` : "/api/admin/hotels", {
        method: hotelId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelName, cityId, isActive }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
      router.push("/admin/hotels");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <Card className="p-6 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Field label="Hotel Name" required>
            <input className={inputCls} value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Hotel Name" />
          </Field>
          <Field label="City" required>
            <select className={inputCls} value={cityId} onChange={(e) => setCityId(e.target.value)}>
              <option value="">--</option>
              {cities.map((c) => (
                <option key={c.CITY_ID} value={c.CITY_ID}>
                  {c.CITY_NAME}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputCls} value={isActive} onChange={(e) => setIsActive(e.target.value)}>
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </Field>
        </div>
      </Card>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/admin/hotels")} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
          <FaSave /> {saving ? "Saving…" : hotelId ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
