"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaArrowDown, FaArrowUp, FaPlus, FaPrint, FaSave, FaTrash } from "react-icons/fa";
import type { SourceItem } from "@/app/api/admin/vouchers/fields";
import { Field, Section, inputCls } from "@/components/admin/ui";
import VoucherSourcePicker, { type SourceKind } from "@/components/admin/VoucherSourcePicker";
import {
  MEAL_PLANS,
  PAYMENT_TERMS,
  ROW_STATUSES,
  nightsBetween,
  serviceLabel,
  type VoucherDoc,
  type VoucherRow,
} from "@/lib/vouchers";

type Hotel = { HOTEL_ID: number; HOTEL_NAME: string; CITY_NAME?: string; ADDRESS?: string; CONTACT_NO?: string };

type RowState = {
  key: string; // React key only; never sent
  hotelId: number | null;
  hotelName: string;
  address: string;
  contact: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  service: string;
  serviceTouched: boolean; // true once the admin typed their own service text
  mealPlan: string;
  status: string;
  refCode: string;
};

type Fields = {
  guestName: string;
  guestNote: string;
  nationality: string;
  contactNo: string;
  paymentTerms: string;
  notes: string;
  source: { type: SourceKind | "manual"; refId: string };
};

type Message = { tone: "error" | "ok"; text: string };

const MEAL_HINTS: Record<string, string> = {
  EP: "EP (room only)",
  CP: "CP (breakfast)",
  MAP: "MAP (breakfast + 1 meal)",
  AP: "AP (all meals)",
};

let rowSeq = 0;
const blankRow = (): RowState => ({
  key: `row-${++rowSeq}`,
  hotelId: null,
  hotelName: "",
  address: "",
  contact: "",
  checkIn: "",
  checkOut: "",
  service: "",
  serviceTouched: false,
  mealPlan: "",
  status: "Confirm",
  refCode: "",
});

/** Stored dates are UTC midnight, so the ISO date part is the calendar day. */
const dateInput = (v: string | Date | undefined): string => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

/** Keeps SERVICE in step with the dates until the admin writes their own. */
function withAutoService(r: RowState): RowState {
  if (r.serviceTouched) return r;
  const nights = nightsBetween(r.checkIn, r.checkOut);
  return { ...r, service: nights > 0 ? serviceLabel(nights) : "" };
}

function rowFromDoc(r: VoucherRow): RowState {
  const checkIn = dateInput(r.CHECK_IN);
  const checkOut = dateInput(r.CHECK_OUT);
  const service = r.SERVICE || "";
  return {
    ...blankRow(),
    hotelId: r.HOTEL_ID ?? null,
    hotelName: r.HOTEL_NAME,
    address: r.ADDRESS || "",
    contact: r.CONTACT || "",
    checkIn,
    checkOut,
    service,
    // A saved service that differs from the date-derived one was typed by the admin.
    serviceTouched: service !== "" && service !== serviceLabel(nightsBetween(checkIn, checkOut)),
    mealPlan: r.MEAL_PLAN || "",
    status: r.STATUS || "Confirm",
    refCode: r.REF_CODE || "",
  };
}

const guestsNote = (n: number) => `x ${n} ${n === 1 ? "Guest" : "Guests"}`;

export default function VoucherForm({ voucher }: { voucher?: VoucherDoc }) {
  const router = useRouter();
  const [f, setF] = useState<Fields>(() => ({
    guestName: voucher?.GUEST_NAME || "",
    guestNote: voucher?.GUEST_NOTE || "",
    nationality: voucher?.NATIONALITY || "Indian",
    contactNo: voucher?.CONTACT_NO || "",
    paymentTerms: voucher?.PAYMENT_TERMS || "Prepaid",
    notes: voucher?.NOTES || "",
    source: { type: voucher?.SOURCE?.TYPE || "manual", refId: voucher?.SOURCE?.REF_ID || "" },
  }));
  const [rows, setRows] = useState<RowState[]>(() =>
    voucher?.ROWS?.length ? voucher.ROWS.map(rowFromDoc) : [blankRow()]
  );
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelsFailed, setHotelsFailed] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [saving, setSaving] = useState<"save" | "print" | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<Fields>) => setF((s) => ({ ...s, ...patch }));
  const text = (name: keyof Omit<Fields, "source">) => ({
    value: f[name],
    onChange: (e: { target: { value: string } }) => set({ [name]: e.target.value }),
  });

  useEffect(() => {
    fetch("/api/admin/hotels?status=Y")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.hotels || []) as Hotel[];
        setHotels([...list].sort((a, b) => a.HOTEL_NAME.localeCompare(b.HOTEL_NAME)));
      })
      .catch(() => setHotelsFailed(true));
  }, []);

  // Errors (and the saved notice) can appear while the admin is down at the buttons.
  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [message]);

  const patchRow = (key: string, patch: Partial<RowState>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const setDates = (key: string, patch: Partial<Pick<RowState, "checkIn" | "checkOut">>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? withAutoService({ ...r, ...patch }) : r)));

  const pickHotel = (key: string, value: string) => {
    if (!value) return patchRow(key, { hotelId: null }); // type manually: keep whatever is typed
    const h = hotels.find((x) => String(x.HOTEL_ID) === value);
    if (!h) return; // the saved-hotel fallback option: nothing to copy
    patchRow(key, { hotelId: h.HOTEL_ID, hotelName: h.HOTEL_NAME, address: h.ADDRESS || "", contact: h.CONTACT_NO || "" });
  };

  const moveRow = (index: number, by: -1 | 1) =>
    setRows((rs) => {
      const next = [...rs];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });

  // Explicit "fill" action: name and contact are fully replaced (even with "" when the booking
  // has no phone) so one booking's phone never ends up under another's name. The note only
  // changes when the booking has a guest count; row dates only when still empty.
  const fillFromSource = (kind: SourceKind, item: SourceItem) => {
    setF((s) => ({
      ...s,
      guestName: item.name,
      contactNo: item.phone,
      guestNote: item.guests !== null && item.guests >= 1 ? guestsNote(item.guests) : s.guestNote,
      source: { type: kind, refId: item.refId },
    }));
    const { from, to } = item;
    if ((kind === "hotel" || kind === "vendor") && from && to) {
      setRows((rs) => {
        const first = rs[0] ?? blankRow();
        if (first.checkIn || first.checkOut) return rs;
        return [withAutoService({ ...first, checkIn: from, checkOut: to }), ...rs.slice(1)];
      });
    }
  };

  const save = async (andPrint: boolean) => {
    if (saving) return;
    setMessage(null);
    setSaving(andPrint ? "print" : "save");
    // Opened inside the click so popup blockers allow it; pointed at the print page once saved.
    const tab = andPrint ? window.open("about:blank", "_blank") : null;
    try {
      const res = await fetch(voucher ? `/api/admin/vouchers/${voucher.VOUCHER_NO}` : "/api/admin/vouchers", {
        method: voucher ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: f.guestName,
          guestNote: f.guestNote,
          nationality: f.nationality,
          contactNo: f.contactNo,
          paymentTerms: f.paymentTerms,
          source: f.source,
          notes: f.notes,
          rows: rows.map((r) => ({
            hotelId: r.hotelId ?? undefined,
            hotelName: r.hotelName,
            address: r.address,
            checkIn: r.checkIn,
            checkOut: r.checkOut,
            service: r.service,
            mealPlan: r.mealPlan,
            status: r.status,
            refCode: r.refCode,
            contact: r.contact,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed.");
      const no: string = data.voucher.VOUCHER_NO;
      if (andPrint) {
        const url = `/admin/voucher-print/${no}`;
        if (tab) tab.location.href = url;
        else window.open(url, "_blank");
      }
      if (voucher) setMessage({ tone: "ok", text: `Voucher ${no} saved.` });
      else router.push(`/admin/vouchers/${no}/edit`);
    } catch (err) {
      tab?.close();
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(null);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save(false);
  };

  return (
    <form onSubmit={submit}>
      <div ref={messageRef}>
        {message && (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={`rounded-lg px-4 py-3 text-sm mb-5 ${
              message.tone === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      <VoucherSourcePicker onPick={fillFromSource} />

      <Section title="Guest">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Guest name" required>
            <input className={inputCls} placeholder="Name on the voucher" {...text("guestName")} />
          </Field>
          <Field label="Guest note">
            <input className={inputCls} placeholder="x 3 Guests (2 Year Child)" {...text("guestNote")} />
          </Field>
          <Field label="Nationality">
            <input className={inputCls} {...text("nationality")} />
          </Field>
          <Field label="Contact no.">
            <input className={inputCls} placeholder="+91 …" {...text("contactNo")} />
          </Field>
          <Field label="Payment terms">
            <select className={inputCls} {...text("paymentTerms")}>
              {PAYMENT_TERMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Hotels" description="One row per hotel stay. Service fills from the dates until you change it.">
        {hotelsFailed && (
          <p className="text-sm text-red-500 mb-3">Couldn&apos;t load the hotel list. Type the hotel details in manually.</p>
        )}
        {rows.map((r, i) => {
          const nights = nightsBetween(r.checkIn, r.checkOut);
          const knownHotel = r.hotelId === null || hotels.some((h) => h.HOTEL_ID === r.hotelId);
          return (
            <div key={r.key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Hotel {i + 1}</h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveRow(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move hotel ${i + 1} up`}
                    title="Move up"
                    className="p-2 text-slate-400 hover:text-gw-brand disabled:opacity-30 disabled:hover:text-slate-400"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(i, 1)}
                    disabled={i === rows.length - 1}
                    aria-label={`Move hotel ${i + 1} down`}
                    title="Move down"
                    className="p-2 text-slate-400 hover:text-gw-brand disabled:opacity-30 disabled:hover:text-slate-400"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                    disabled={rows.length === 1}
                    aria-label={`Remove hotel ${i + 1}`}
                    title={rows.length === 1 ? "A voucher needs at least one hotel" : "Remove"}
                    className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                <div className="sm:col-span-3">
                  <Field label="Pick from Hotel List">
                    <select
                      className={inputCls}
                      value={r.hotelId === null ? "" : String(r.hotelId)}
                      onChange={(e) => pickHotel(r.key, e.target.value)}
                    >
                      <option value="">— Type manually —</option>
                      {!knownHotel && <option value={String(r.hotelId)}>{r.hotelName} (saved on this voucher)</option>}
                      {hotels.map((h) => (
                        <option key={h.HOTEL_ID} value={h.HOTEL_ID}>
                          {h.HOTEL_NAME}
                          {h.CITY_NAME ? ` — ${h.CITY_NAME}` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Hotel name" required>
                    <input className={inputCls} value={r.hotelName} onChange={(e) => patchRow(r.key, { hotelName: e.target.value })} />
                  </Field>
                </div>
                <Field label="Contact">
                  <input className={inputCls} value={r.contact} onChange={(e) => patchRow(r.key, { contact: e.target.value })} />
                </Field>
                <div className="sm:col-span-3">
                  <Field label="Address">
                    <textarea rows={2} className={inputCls} value={r.address} onChange={(e) => patchRow(r.key, { address: e.target.value })} />
                  </Field>
                </div>
                <Field label="Check-in" required>
                  <input type="date" className={inputCls} value={r.checkIn} onChange={(e) => setDates(r.key, { checkIn: e.target.value })} />
                </Field>
                <Field label="Check-out" required>
                  <input type="date" className={inputCls} value={r.checkOut} min={r.checkIn || undefined} onChange={(e) => setDates(r.key, { checkOut: e.target.value })} />
                </Field>
                <Field label="Service">
                  <input
                    className={inputCls}
                    value={r.service}
                    placeholder={nights > 0 ? serviceLabel(nights) : "e.g. 2D/2N"}
                    onChange={(e) =>
                      // Clearing the box hands control back to the dates.
                      patchRow(r.key, { service: e.target.value, serviceTouched: e.target.value.trim() !== "" })
                    }
                  />
                </Field>
                {r.checkIn && r.checkOut && (
                  <p className={`sm:col-span-3 -mt-2 mb-3 text-xs ${nights > 0 ? "text-slate-400" : "text-red-500"}`}>
                    {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "Check-out must be after check-in"}
                  </p>
                )}
                <Field label="Meal plan">
                  <select className={inputCls} value={r.mealPlan} onChange={(e) => patchRow(r.key, { mealPlan: e.target.value })}>
                    <option value="">—</option>
                    {MEAL_PLANS.map((m) => (
                      <option key={m} value={m}>
                        {MEAL_HINTS[m] || m}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={inputCls} value={r.status} onChange={(e) => patchRow(r.key, { status: e.target.value })}>
                    {ROW_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ref code">
                  <input className={inputCls} value={r.refCode} onChange={(e) => patchRow(r.key, { refCode: e.target.value })} />
                </Field>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, blankRow()])}
          className="flex items-center gap-2 text-sm font-bold text-gw-brand hover:underline"
        >
          <FaPlus /> Add hotel
        </button>
      </Section>

      <Section title="Notes" description="Printed under the hotel table.">
        <textarea rows={4} className={inputCls} {...text("notes")} />
      </Section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/vouchers")}
          className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving !== null}
          className="flex items-center gap-2 border border-gw-brand text-gw-brand hover:bg-green-50 font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60"
        >
          <FaPrint /> {saving === "print" ? "Saving…" : "Save & Print"}
        </button>
        <button
          type="submit"
          disabled={saving !== null}
          className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60"
        >
          <FaSave /> {saving === "save" ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
