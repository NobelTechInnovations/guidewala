"use client";

import { useEffect, useState, FormEvent } from "react";
import { FaPlus } from "react-icons/fa";
import { PageHeader, Card, Field, inputCls, Toggle, Loading, EmptyState } from "@/components/admin/ui";

type City = { CITY_ID: string; CITY_NAME: string; STATE_NAME: string; IS_ACTIVE: string };
type State = { STATE_ID: string; STATE_NAME: string };

export default function CitiesPage() {
  const [cities, setCities] = useState<City[] | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/admin/cities")
      .then((r) => r.json())
      .then((d) => {
        setCities(d.cities || []);
        setStates(d.states || []);
      });

  useEffect(() => {
    load();
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stateId }),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(d.error || "Could not add the city.");
    setName("");
    load();
  };

  const toggle = async (c: City, on: boolean) => {
    setCities((list) => list?.map((x) => (x.CITY_ID === c.CITY_ID ? { ...x, IS_ACTIVE: on ? "Y" : "N" } : x)) ?? null);
    const res = await fetch("/api/admin/cities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityId: c.CITY_ID, isActive: on ? "Y" : "N" }),
    });
    if (!res.ok) {
      alert("Could not update the city.");
      load();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="Cities" subtitle="Cities offered for guide services, packages and hotels" />

      <Card className="p-6 mb-6">
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-x-4 items-end">
          <Field label="City name" required>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Varanasi" />
          </Field>
          <Field label="State">
            <select className={inputCls} value={stateId} onChange={(e) => setStateId(e.target.value)}>
              <option value="">—</option>
              {states.map((s) => (
                <option key={s.STATE_ID} value={s.STATE_ID}>
                  {s.STATE_NAME}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="mb-4 flex items-center justify-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60"
          >
            <FaPlus /> {saving ? "Adding…" : "Add City"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </Card>

      {cities === null ? (
        <Loading />
      ) : cities.length === 0 ? (
        <EmptyState message="No cities yet." />
      ) : (
        <Card className="divide-y divide-slate-100">
          {cities.map((c) => (
            <div key={c.CITY_ID} className={`flex items-center justify-between gap-4 px-5 py-3 ${c.IS_ACTIVE === "Y" ? "" : "opacity-60"}`}>
              <div>
                <p className="font-bold text-slate-900">{c.CITY_NAME}</p>
                <p className="text-xs text-slate-500">
                  {c.CITY_ID}
                  {c.STATE_NAME && ` · ${c.STATE_NAME}`}
                </p>
              </div>
              <Toggle checked={c.IS_ACTIVE === "Y"} onChange={(on) => toggle(c, on)} label="Active" />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
