"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaSave } from "react-icons/fa";
import { Card, Field, inputCls } from "@/components/admin/ui";

export default function PackageForm({
  pkgId,
  initial,
}: {
  pkgId?: number;
  initial?: { title: string; cityId: string; amount: string; desc: string; isActive: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [cityId, setCityId] = useState(initial?.cityId || "");
  const [amount, setAmount] = useState(initial?.amount || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [isActive, setIsActive] = useState(initial?.isActive || "Y");
  const [image, setImage] = useState<File | null>(null);
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
    if (!title || !cityId || !amount) {
      setError("Title, City and Amount are required.");
      return;
    }
    if (!pkgId && !image) {
      setError("Package image is required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("cityId", cityId);
      fd.set("amount", amount);
      fd.set("desc", desc);
      fd.set("isActive", isActive);
      if (image) fd.set("image", image);

      const res = await fetch(pkgId ? `/api/admin/packages/${pkgId}` : "/api/admin/packages", {
        method: pkgId ? "PUT" : "POST",
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
      router.push("/admin/packages");
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
        <Field label="Package Title" required>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="City Name" required>
            <select className={inputCls} value={cityId} onChange={(e) => setCityId(e.target.value)}>
              <option value="">--</option>
              {cities.map((c) => (
                <option key={c.CITY_ID} value={c.CITY_ID}>
                  {c.CITY_NAME}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Package Amount" required>
            <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label={pkgId ? "Package Image (leave blank to keep)" : "Package Image (900 × 500 px)"} required={!pkgId}>
            <input
              className={inputCls}
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={isActive} onChange={(e) => setIsActive(e.target.value)}>
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </Field>
        </div>
        <Field label="Package Description">
          <textarea rows={5} className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Package Description" />
        </Field>
      </Card>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/admin/packages")} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
          <FaSave /> {saving ? "Saving…" : pkgId ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
