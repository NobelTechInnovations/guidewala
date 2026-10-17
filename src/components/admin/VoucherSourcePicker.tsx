"use client";

import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import type { SourceItem } from "@/app/api/admin/vouchers/fields";
import { Section, inputCls } from "@/components/admin/ui";

export type SourceKind = "hotel" | "guide" | "vendor";

const TABS: { kind: SourceKind; label: string }[] = [
  { kind: "hotel", label: "Hotel" },
  { kind: "guide", label: "Guide" },
  { kind: "vendor", label: "Vendor" },
];

type Result = { kind: SourceKind; key: string; items: SourceItem[]; error: string };

/** "Fill from booking": pick a source tab, search, click a booking to hand it to the form. */
export default function VoucherSourcePicker({ onPick }: { onPick: (kind: SourceKind, item: SourceItem) => void }) {
  const [kind, setKind] = useState<SourceKind>("hotel");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [filled, setFilled] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // The result carries the key it was fetched for, so "loading" is derived and a
  // slow response for an old tab/search can never overwrite a newer one.
  const key = `${kind}|${debouncedQ}`;
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/admin/vouchers/sources?type=${kind}&q=${encodeURIComponent(debouncedQ)}`, { signal: ctrl.signal })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Search failed.");
        setResult({ kind, key, items: d.items || [], error: "" });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setResult({ kind, key, items: [], error: err?.message || "Search failed." });
      });
    return () => ctrl.abort();
  }, [kind, debouncedQ, key]);

  const loading = result?.key !== key || q.trim() !== debouncedQ;
  // Never show another tab's results: they'd be filled in under the wrong source type.
  const current = result?.kind === kind ? result : null;
  const items = current?.items ?? [];

  return (
    <Section title="Fill from booking" description="Pick an existing booking to copy the guest details and stay dates. You can edit everything afterwards.">
      <div role="tablist" aria-label="Booking source" className="inline-flex rounded-lg bg-slate-100 p-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            role="tab"
            aria-selected={kind === t.kind}
            onClick={() => setKind(t.kind)}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
              kind === t.kind ? "bg-white text-gw-brand shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mb-3">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" aria-hidden />
        <input
          className={`${inputCls} pl-9`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          // Enter must not submit the voucher form this picker sits inside.
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="Search by name, phone or booking ID"
          aria-label="Search bookings"
        />
      </div>

      {current?.error ? (
        <p className="text-sm text-red-500">{current.error}</p>
      ) : loading && items.length === 0 ? (
        <p className="text-sm text-slate-400">Searching…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">No bookings found.</p>
      ) : (
        <ul className={`max-h-64 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100 ${loading ? "opacity-60" : ""}`}>
          {items.map((item, i) => (
            <li key={`${item.refId}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  onPick(kind, item);
                  setFilled(item.label);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
              >
                <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                {(item.phone || item.guests !== null) && (
                  <span className="block text-xs text-slate-500">
                    {[item.phone, item.guests !== null ? `${item.guests} guest${item.guests === 1 ? "" : "s"}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {filled && (
        <p role="status" className="mt-3 text-sm text-green-700">
          Filled from {filled}. Check the details below.
        </p>
      )}
    </Section>
  );
}
