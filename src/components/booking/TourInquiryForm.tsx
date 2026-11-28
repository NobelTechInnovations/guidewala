"use client";

import { useState, FormEvent } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type Status = "idle" | "submitting" | "success" | "error";

/** Today as yyyy-mm-dd in the visitor's local time (min for the date picker). */
function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** Short tour package enquiry: name, phone, travel date, persons. The package is attached server-side. */
export default function TourInquiryForm({
  pkgId,
  cancellationPolicy,
}: {
  pkgId: number;
  /** Shown as a note above the submit button; the form still works without it. */
  cancellationPolicy?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", travelDate: "", persons: "" });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\d{10}$/.test(form.phone.trim())) return "Please enter a 10 digit phone number.";
    if (!form.travelDate) return "Please select your travel date.";
    if (!(Number(form.persons) >= 1)) return "Please enter the number of persons.";
    return "";
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus("error");
      setErrorMsg(err);
      return;
    }
    setErrorMsg("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/tour-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pkgId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <FaCheckCircle className="text-4xl text-gw-brand mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">Enquiry received!</h3>
        <p className="text-slate-500 text-sm">
          Our team will call you shortly to plan your tour and confirm the booking.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Booking Enquiry</h2>

      {status === "error" && errorMsg && (
        <div role="alert" className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <FaTimesCircle /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="ti-name" className="frm-label">
            Name <span className="text-red-500">*</span>
          </label>
          <input id="ti-name" className="modern-input" maxLength={50} autoComplete="name" placeholder="Your name" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <label htmlFor="ti-phone" className="frm-label">
            Phone / WhatsApp No. <span className="text-red-500">*</span>
          </label>
          <input
            id="ti-phone"
            type="tel"
            inputMode="numeric"
            className="modern-input"
            maxLength={10}
            autoComplete="tel-national"
            placeholder="10 digit number"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
          />
        </div>
        <div>
          <label htmlFor="ti-date" className="frm-label">
            Travel Date <span className="text-red-500">*</span>
          </label>
          <input id="ti-date" type="date" min={todayIso()} className="modern-input" value={form.travelDate} onChange={set("travelDate")} />
        </div>
        <div>
          <label htmlFor="ti-persons" className="frm-label">
            Number of Persons <span className="text-red-500">*</span>
          </label>
          <input id="ti-persons" type="number" min={1} max={500} className="modern-input" placeholder="No. of persons" value={form.persons} onChange={set("persons")} />
        </div>
      </div>

      {cancellationPolicy && (
        <p className="mt-8 text-xs leading-relaxed text-slate-500">
          By sending this enquiry you agree to our cancellation policy:{" "}
          <span className="whitespace-pre-line">{cancellationPolicy}</span>{" "}
          <a href="#cancellation" className="font-semibold text-gw-brand underline underline-offset-2">
            Read full policy
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={`${cancellationPolicy ? "mt-3" : "mt-8"} w-full bg-gw-red hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors`}
      >
        {status === "submitting" ? "SENDING..." : "SEND ENQUIRY"}
      </button>
    </form>
  );
}
