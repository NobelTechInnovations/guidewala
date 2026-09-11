"use client";

import { useEffect, useState, use, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import { PageHeader, Card, Field, EmptyState, Loading, inputCls } from "@/components/admin/ui";

type Item = { ID: number; ITINERARY: string; PACKAGE_DESC: string; PKG_IMAGE: string };
type Pkg = { TITLE_NAME: string; CITY_ID: string; PKG_AMOUNT: number };

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "";

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [pkgRes, itinRes] = await Promise.all([
      fetch(`/api/admin/packages/${id}`).then((r) => r.json()),
      fetch(`/api/admin/packages/${id}/itinerary`).then((r) => r.json()),
    ]);
    setPkg(pkgRes.pkg);
    setItems(itinRes.itinerary);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openNew = () => {
    setEditing("new");
    setName("");
    setDesc("");
    setImage(null);
    setError("");
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setName(item.ITINERARY);
    setDesc(item.PACKAGE_DESC);
    setImage(null);
    setError("");
  };

  const cancel = () => setEditing(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name) {
      setError("Itinerary Name is required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("desc", desc);
      if (image) fd.set("image", image);

      const url = editing === "new" ? `/api/admin/packages/${id}/itinerary` : `/api/admin/itinerary/${(editing as Item).ID}`;
      const res = await fetch(url, { method: editing === "new" ? "POST" : "PUT", body: fd });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Item) => {
    if (!confirm("Are you sure to delete this itinerary?")) return;
    await fetch(`/api/admin/itinerary/${item.ID}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/admin/packages" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <FaArrowLeft /> Back to Packages
      </Link>
      <PageHeader
        title={pkg?.TITLE_NAME || "Itinerary"}
        subtitle={pkg ? `₹${pkg.PKG_AMOUNT?.toLocaleString("en-IN")}/-` : undefined}
        action={
          !editing && (
            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm"
            >
              <FaPlus /> New Itinerary
            </button>
          )
        }
      />

      {editing && (
        <Card className="p-6 mb-6">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Field label="Itinerary Name" required>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Itinerary Image (500 × 300 px)">
                <input className={inputCls} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </Field>
            </div>
            <Field label="Itinerary Description">
              <textarea rows={4} className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={cancel} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100">
                <FaTimes /> Cancel
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
                <FaSave /> {saving ? "Saving…" : editing === "new" ? "Save" : "Update"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState message="No itinerary items yet." />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <Card key={item.ID} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-900">{item.ITINERARY}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(item)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => remove(item)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                {item.PKG_IMAGE && (
                  <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <Image src={`${IMG_BASE}/img/pkgItinImg/${item.PKG_IMAGE}`} alt={item.ITINERARY} fill sizes="128px" className="object-cover" />
                  </div>
                )}
                <p className="text-sm text-slate-600">{item.PACKAGE_DESC}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
