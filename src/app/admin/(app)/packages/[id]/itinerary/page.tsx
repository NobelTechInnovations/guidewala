"use client";

import { useEffect, useState, use, FormEvent } from "react";
import Link from "next/link";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaUtensils, FaBed } from "react-icons/fa";
import { PageHeader, Card, Field, Badge, Toggle, EmptyState, Loading, inputCls } from "@/components/admin/ui";
import HomeToggle from "@/components/admin/HomeToggle";
import UploadedImage from "@/components/UploadedImage";
import { mediaPath } from "@/lib/media";
import { MEAL_OPTIONS, htmlToText, isShown, looksLikeHtml, type ItineraryDoc } from "@/lib/packages";

type Item = ItineraryDoc & { imageMissing?: boolean }; // imageMissing: image file absent from disk
type Pkg = { TITLE_NAME: string; CITY_ID: string; PKG_AMOUNT: number; SHOW_ON_HOME?: string };

/** Legacy descriptions are HTML; show/edit them as plain text. Plain text passes through. */
function descText(desc?: string): string {
  const s = desc ?? "";
  return looksLikeHtml(s) ? htmlToText(s) : s;
}

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [dayNo, setDayNo] = useState("");
  const [meals, setMeals] = useState<string[]>([]);
  const [stay, setStay] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number[]>([]); // IDs with a "Shown on site" save in flight

  const load = () =>
    Promise.all([
      fetch(`/api/admin/packages/${id}`).then((r) => r.json()),
      fetch(`/api/admin/packages/${id}/itinerary`).then((r) => r.json()),
    ]).then(([pkgRes, itinRes]) => {
      setPkg(pkgRes.pkg);
      setItems(itinRes.itinerary);
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openNew = () => {
    setEditing("new");
    setName("");
    setDesc("");
    setDayNo("");
    setMeals([]);
    setStay("");
    setImage(null);
    setError("");
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setName(item.ITINERARY ?? "");
    setDesc(descText(item.PACKAGE_DESC));
    setDayNo(item.DAY_NO ? String(item.DAY_NO) : "");
    setMeals((item.MEALS ?? []).filter((m) => (MEAL_OPTIONS as readonly string[]).includes(m)));
    setStay(item.STAY ?? "");
    setImage(null);
    setError("");
  };

  const cancel = () => setEditing(null);

  const toggleMeal = (meal: string) =>
    setMeals((cur) => (cur.includes(meal) ? cur.filter((m) => m !== meal) : [...cur, meal]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Itinerary Name is required.");
      return;
    }
    if (dayNo.trim() && !/^[1-9]\d*$/.test(dayNo.trim())) {
      setError("Day number must be a whole number, 1 or more.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("desc", desc);
      // Always sent, even when blank, so editing can clear a day / meals / stay.
      fd.set("dayNo", dayNo.trim());
      fd.set("meals", JSON.stringify(meals));
      fd.set("stay", stay);
      if (image) fd.set("image", image);

      const url = editing === "new" ? `/api/admin/packages/${id}/itinerary` : `/api/admin/itinerary/${(editing as Item).ID}`;
      const res = await fetch(url, { method: editing === "new" ? "POST" : "PUT", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed.");
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

  /** Instant "Shown on site" switch: flips optimistically, reverts (with an alert) if the save fails. */
  const setShown = async (item: Item, next: boolean) => {
    const was = isShown(item.IS_ACTIVE);
    const apply = (shown: boolean) =>
      setItems((cur) => cur && cur.map((i) => (i.ID === item.ID ? { ...i, IS_ACTIVE: shown ? "Y" : "N" } : i)));
    apply(next);
    setToggling((cur) => [...cur, item.ID]);
    try {
      const res = await fetch(`/api/admin/itinerary/${item.ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next ? "Y" : "N" }),
      });
      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not update this itinerary.");
      }
    } catch (err) {
      apply(was);
      alert(err instanceof Error ? err.message : "Could not update this itinerary.");
    } finally {
      setToggling((cur) => cur.filter((x) => x !== item.ID));
    }
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
          <div className="flex items-center gap-4 flex-wrap">
            {/* HomeToggle only reads `initial` on mount, so wait for the package. */}
            {pkg && <HomeToggle pkgId={Number(id)} initial={pkg.SHOW_ON_HOME === "N" ? "N" : "Y"} />}
            {!editing && (
              <button
                onClick={openNew}
                className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm"
              >
                <FaPlus /> New Itinerary
              </button>
            )}
          </div>
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
                {editing !== "new" && editing.imageMissing && (
                  <span className="block text-xs text-red-600 mt-1.5">The current image file is missing — upload a new one.</span>
                )}
              </Field>
              <Field label="Day number">
                <input
                  className={inputCls}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder="e.g. 1 — leave blank if not day-wise"
                  value={dayNo}
                  onChange={(e) => setDayNo(e.target.value)}
                />
              </Field>
              <Field label="Overnight stay">
                <input className={inputCls} value={stay} onChange={(e) => setStay(e.target.value)} placeholder="e.g. Bikaner" />
              </Field>
            </div>
            <fieldset className="mb-4">
              <legend className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Meals included</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {MEAL_OPTIONS.map((meal) => (
                  <label key={meal} className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-gw-brand"
                      checked={meals.includes(meal)}
                      onChange={() => toggleMeal(meal)}
                    />
                    {meal}
                  </label>
                ))}
              </div>
            </fieldset>
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
          {items.map((item) => {
            const shown = isShown(item.IS_ACTIVE);
            // Hidden items are dimmed, but the switch and buttons stay at full strength.
            const dim = shown ? "" : "opacity-50";
            const mealList = item.MEALS ?? [];
            return (
              <Card key={item.ID} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`flex items-center gap-2 flex-wrap min-w-0 ${dim}`}>
                    {item.DAY_NO ? <Badge tone="green">Day {item.DAY_NO}</Badge> : null}
                    <h3 className="font-bold text-slate-900">{item.ITINERARY}</h3>
                    {!shown && <Badge tone="slate">Hidden</Badge>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(item)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => remove(item)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
                <div className={`flex gap-4 ${dim}`}>
                  {item.PKG_IMAGE && (
                    <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      <UploadedImage
                        src={item.imageMissing ? null : mediaPath("pkgItinImg", item.PKG_IMAGE)}
                        alt={item.ITINERARY ?? ""}
                        sizes="128px"
                        className="object-cover"
                      />
                      {item.imageMissing && (
                        <div className="absolute bottom-1 left-1">
                          <Badge tone="red">Missing image</Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {(mealList.length > 0 || item.STAY) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500 mb-1.5">
                        {mealList.length > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <FaUtensils aria-hidden /> {mealList.join(", ")}
                          </span>
                        )}
                        {item.STAY && (
                          <span className="inline-flex items-center gap-1.5">
                            <FaBed aria-hidden /> {item.STAY}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-slate-600 whitespace-pre-line">{descText(item.PACKAGE_DESC)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Toggle checked={shown} onChange={(next) => setShown(item, next)} label="Shown on site" disabled={toggling.includes(item.ID)} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
