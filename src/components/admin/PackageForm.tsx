"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaPlus, FaTimes } from "react-icons/fa";
import { Badge, Field, Section, Toggle, inputCls } from "@/components/admin/ui";
import ListField from "@/components/admin/ListField";
import UploadedImage from "@/components/UploadedImage";
import { INCLUDE_OPTIONS, TOUR_TYPES, linesToList } from "@/lib/packages";
import { DEFAULT_CANCELLATION_POLICY } from "@/lib/policies";
import { mediaPath } from "@/lib/media";

/**
 * One key per multipart field of POST/PUT /api/admin/packages. Lists are
 * textarea strings (one item per line), numbers stay strings until sent.
 * `image`, `gallery` and `brochure` hold the *stored* filenames (for
 * previews); newly picked files live in component state, not here.
 */
export type PackageFormValues = {
  title: string;
  cityId: string;
  amount: string;
  desc: string;
  isActive: string; // "Y" | "N"
  showOnHome: string; // "Y" | "N"
  priceNote: string;
  tourType: string;
  durationDays: string;
  durationNights: string;
  route: { city: string; nights: string }[];
  includes: string[];
  highlights: string;
  inclusions: string;
  exclusions: string;
  documents: string;
  thingsToCarry: string;
  notes: string;
  cancellationPolicy: string;
  image: string;
  gallery: string[];
  brochure: string;
};

/** Stored files known to be absent from disk (from the admin GET), flagged for re-upload. */
export type MissingMedia = { image: boolean; gallery: string[] };

const EMPTY: PackageFormValues = {
  title: "",
  cityId: "",
  amount: "",
  desc: "",
  isActive: "Y",
  showOnHome: "Y",
  priceNote: "",
  tourType: "",
  durationDays: "",
  durationNights: "",
  route: [],
  includes: [],
  highlights: "",
  inclusions: "",
  exclusions: "",
  documents: "",
  thingsToCarry: "",
  notes: "",
  cancellationPolicy: "",
  image: "",
  gallery: [],
  brochure: "",
};

function withDefaults(initial?: Partial<PackageFormValues>): PackageFormValues {
  const out: Record<string, unknown> = { ...EMPTY };
  for (const [key, value] of Object.entries(initial ?? {})) {
    if (value !== undefined) out[key] = value;
  }
  return out as PackageFormValues;
}

/** `inputCls` narrowed for the nights box next to a full-width city input. */
const nightsCls = inputCls.replace("w-full", "w-28 shrink-0");

const smallBtn =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200";

export default function PackageForm({
  pkgId,
  initial,
  missing,
}: {
  pkgId?: number;
  initial?: Partial<PackageFormValues>;
  missing?: MissingMedia;
}) {
  const router = useRouter();
  const [v, setV] = useState<PackageFormValues>(() => withDefaults(initial));
  const [image, setImage] = useState<File | null>(null);
  const [newGallery, setNewGallery] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [removeBrochure, setRemoveBrochure] = useState(false);
  const [cities, setCities] = useState<{ CITY_ID: string; CITY_NAME: string }[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const set = <K extends keyof PackageFormValues>(key: K, value: PackageFormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    fetch("/api/admin/lookups")
      .then((r) => r.json())
      .then((d) => setCities(d.cities));
  }, []);

  // The form is long and Save sits at the bottom: bring a validation / server error into view.
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  const setRouteStop = (i: number, patch: Partial<PackageFormValues["route"][number]>) =>
    set(
      "route",
      v.route.map((stop, j) => (j === i ? { ...stop, ...patch } : stop))
    );

  const toggleInclude = (opt: string) =>
    set("includes", v.includes.includes(opt) ? v.includes.filter((o) => o !== opt) : [...v.includes, opt]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!v.title.trim() || !v.cityId || !v.amount.trim()) {
      setError("Title, City and Amount are required.");
      return;
    }
    if (!pkgId && !image) {
      setError("Package image is required.");
      return;
    }

    // The API rejects a stop without a city, so drop fully blank rows here;
    // a row with nights but no city is a mistake worth pointing out, not dropping.
    const route: { city: string; nights: string }[] = [];
    for (const [i, stop] of v.route.entries()) {
      const city = stop.city.trim();
      const nights = stop.nights.trim();
      if (!city && nights) {
        setError(`Route stop ${i + 1} needs a city (or remove the row).`);
        return;
      }
      if (city) route.push({ city, nights });
    }

    setSaving(true);
    try {
      // The form owns the whole record, so every scalar / list key is sent on every save.
      const fd = new FormData();
      fd.set("title", v.title.trim());
      fd.set("cityId", v.cityId);
      fd.set("amount", v.amount.trim());
      fd.set("desc", v.desc);
      fd.set("isActive", v.isActive);
      fd.set("showOnHome", v.showOnHome);
      fd.set("priceNote", v.priceNote);
      fd.set("tourType", v.tourType);
      fd.set("durationDays", v.durationDays);
      fd.set("durationNights", v.durationNights);
      fd.set("route", JSON.stringify(route));
      fd.set("includes", JSON.stringify(v.includes));
      fd.set("highlights", JSON.stringify(linesToList(v.highlights)));
      fd.set("inclusions", JSON.stringify(linesToList(v.inclusions)));
      fd.set("exclusions", JSON.stringify(linesToList(v.exclusions)));
      fd.set("documents", JSON.stringify(linesToList(v.documents)));
      fd.set("thingsToCarry", JSON.stringify(linesToList(v.thingsToCarry)));
      fd.set("notes", JSON.stringify(linesToList(v.notes)));
      fd.set("cancellationPolicy", v.cancellationPolicy);

      if (image) fd.set("image", image);
      for (const file of newGallery) fd.append("gallery", file);
      // On edit, the kept filenames are the whole story: omitting this key would leave the
      // gallery as stored, and `[]` clears it. (New packages have nothing to keep.)
      if (pkgId) fd.set("keepGallery", JSON.stringify(v.gallery));
      if (brochureFile) fd.set("brochure", brochureFile);
      else if (removeBrochure) fd.set("removeBrochure", "1");

      const res = await fetch(pkgId ? `/api/admin/packages/${pkgId}` : "/api/admin/packages", {
        method: pkgId ? "PUT" : "POST",
        body: fd,
      });
      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed.");
      }
      router.push("/admin/packages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const coverMissing = !!pkgId && (missing?.image || !v.image);

  return (
    <form onSubmit={submit}>
      <Section title="Basics">
        <Field label="Package Title" required>
          <input className={inputCls} value={v.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="City Name" required>
            <select className={inputCls} value={v.cityId} onChange={(e) => set("cityId", e.target.value)}>
              <option value="">--</option>
              {cities.map((c) => (
                <option key={c.CITY_ID} value={c.CITY_ID}>
                  {c.CITY_NAME}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Package Amount" required>
            <input
              className={inputCls}
              type="number"
              min={0}
              value={v.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Price Note">
            <input
              className={inputCls}
              value={v.priceNote}
              onChange={(e) => set("priceNote", e.target.value)}
              placeholder="e.g. per person, twin sharing"
            />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={v.isActive} onChange={(e) => set("isActive", e.target.value)}>
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>
          </Field>
        </div>
        <Toggle
          checked={v.showOnHome !== "N"}
          onChange={(on) => set("showOnHome", on ? "Y" : "N")}
          label="Show on Home"
        />
      </Section>

      <Section title="Trip info">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Field label="Days">
            <input
              className={inputCls}
              type="number"
              min={0}
              step={1}
              value={v.durationDays}
              onChange={(e) => set("durationDays", e.target.value)}
            />
          </Field>
          <Field label="Nights">
            <input
              className={inputCls}
              type="number"
              min={0}
              step={1}
              value={v.durationNights}
              onChange={(e) => set("durationNights", e.target.value)}
            />
          </Field>
          <Field label="Tour Type">
            <select className={inputCls} value={v.tourType} onChange={(e) => set("tourType", e.target.value)}>
              <option value="">--</option>
              {TOUR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mb-4">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Route</span>
          {v.route.length === 0 && <p className="text-xs text-slate-400 mb-2">No stops added.</p>}
          <div className="space-y-2">
            {v.route.map((stop, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={stop.city}
                  onChange={(e) => setRouteStop(i, { city: e.target.value })}
                  placeholder="City"
                  aria-label={`Route stop ${i + 1} city`}
                />
                <input
                  className={nightsCls}
                  type="number"
                  min={0}
                  step={1}
                  value={stop.nights}
                  onChange={(e) => setRouteStop(i, { nights: e.target.value })}
                  placeholder="Nights"
                  aria-label={`Route stop ${i + 1} nights`}
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "route",
                      v.route.filter((_, j) => j !== i)
                    )
                  }
                  className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove route stop ${i + 1}`}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => set("route", [...v.route, { city: "", nights: "" }])}
            className={`${smallBtn} mt-2`}
          >
            <FaPlus /> Add stop
          </button>
        </div>

        <fieldset>
          <legend className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            Tour includes
          </legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {INCLUDE_OPTIONS.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-gw-brand"
                  checked={v.includes.includes(opt)}
                  onChange={() => toggleInclude(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section title="Overview">
        <Field label="Package Description">
          <textarea
            rows={6}
            className={inputCls}
            value={v.desc}
            onChange={(e) => set("desc", e.target.value)}
            placeholder="Package Description"
          />
        </Field>
        <p className="-mt-2 text-xs text-slate-400">Plain text. Start a new line for a new paragraph.</p>
      </Section>

      <Section title="Media">
        <Field label={pkgId ? "Cover Image (leave blank to keep)" : "Cover Image (900 × 500 px)"} required={!pkgId}>
          <input
            className={inputCls}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </Field>
        {pkgId && (
          <div className="-mt-1 mb-4 flex items-center gap-3">
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <UploadedImage
                src={coverMissing ? null : mediaPath("pkgTitleImg", v.image)}
                alt="Current cover image"
                sizes="128px"
                className="object-cover"
              />
            </div>
            {coverMissing && <Badge tone="red">Missing image — re-upload</Badge>}
          </div>
        )}

        <Field label="Gallery Images">
          <input
            className={inputCls}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              // Copy before resetting: clearing the input empties the live FileList.
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (picked.length) setNewGallery((prev) => [...prev, ...picked]);
            }}
          />
          <span className="block text-xs text-slate-400 mt-1">Up to ~40 MB per save</span>
        </Field>
        {v.gallery.length > 0 && (
          <ul className="-mt-1 mb-4 flex flex-wrap gap-3">
            {v.gallery.map((file) => {
              const gone = missing?.gallery.includes(file);
              return (
                <li key={file} className="relative h-20 w-28 overflow-hidden rounded-lg bg-slate-100">
                  <UploadedImage
                    src={gone ? null : mediaPath("pkgGallery", file)}
                    alt="Gallery image"
                    sizes="112px"
                    className="object-cover"
                  />
                  {gone && (
                    <span className="absolute inset-x-0 bottom-0 bg-red-600/90 py-0.5 text-center text-[10px] font-bold text-white">
                      Missing
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "gallery",
                        v.gallery.filter((f) => f !== file)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-xs text-white hover:bg-red-600"
                    aria-label="Remove gallery image"
                  >
                    <FaTimes />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {newGallery.length > 0 && (
          <div className="-mt-1 mb-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">To be added on save</p>
            <ul className="space-y-1">
              {newGallery.map((file, i) => (
                <li key={`${file.name}-${i}`} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="min-w-0 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setNewGallery(newGallery.filter((_, j) => j !== i))}
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${file.name}`}
                  >
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Field label="Brochure (PDF)">
          <input
            className={inputCls}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setBrochureFile(e.target.files?.[0] || null)}
          />
        </Field>
        {pkgId && v.brochure && (
          <div className="-mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <a
              href={mediaPath("pkgBrochure", v.brochure) ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-gw-brand underline"
            >
              Current brochure
            </a>
            <label className="inline-flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 accent-gw-brand"
                checked={removeBrochure}
                onChange={(e) => setRemoveBrochure(e.target.checked)}
              />
              Remove brochure
            </label>
          </div>
        )}
      </Section>

      <Section title="Highlights & inclusions">
        <ListField label="Highlights" value={v.highlights} onChange={(x) => set("highlights", x)} />
        <ListField label="Inclusions" value={v.inclusions} onChange={(x) => set("inclusions", x)} />
        <ListField label="Exclusions" value={v.exclusions} onChange={(x) => set("exclusions", x)} />
      </Section>

      <Section title="Need to know">
        <ListField label="Documents Required" value={v.documents} onChange={(x) => set("documents", x)} />
        <ListField label="Things to Carry" value={v.thingsToCarry} onChange={(x) => set("thingsToCarry", x)} />
        <ListField label="Important Notes" value={v.notes} onChange={(x) => set("notes", x)} />
      </Section>

      <Section title="Cancellation policy">
        <Field label="Policy">
          <textarea
            rows={4}
            className={inputCls}
            value={v.cancellationPolicy}
            onChange={(e) => set("cancellationPolicy", e.target.value)}
            placeholder={DEFAULT_CANCELLATION_POLICY}
          />
          <span className="block text-xs text-slate-400 mt-1">Leave blank to use the default</span>
        </Field>
      </Section>

      {error && (
        <p ref={errorRef} role="alert" className="text-red-500 text-sm mb-4">
          {error}
        </p>
      )}
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
