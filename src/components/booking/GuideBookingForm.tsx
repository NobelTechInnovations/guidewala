"use client";

import { useState, FormEvent } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const LANGUAGES = [
  "All",
  "Hindi",
  "English",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Russian",
  "Mandarin",
  "Japanese",
  "Arab",
  "Korean",
  "Gujarati",
  "Tamil",
  "Bengali",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function GuideBookingForm({
  pkgId,
  pkgAmount,
  hotels,
}: {
  pkgId: number;
  pkgAmount: number;
  hotels: string[];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    dateOfSightseeing: "",
    timeOfReporting: "",
    hotelOfReporting: "",
    otherHotel: "",
    guideLanguage: "All",
    numberOfPersons: "",
    existingCustomer: "",
    custName: "",
    phoneNo: "",
    whatsAppNo: "",
    email: "",
    message: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.dateOfSightseeing) return "Please select the date of sightseeing.";
    if (!form.timeOfReporting) return "Please select the guide reporting time.";
    if (form.hotelOfReporting === "Other" && !form.otherHotel.trim())
      return "Please enter the hotel name.";
    if (!form.numberOfPersons.trim()) return "Please enter the number of persons.";
    if (!form.existingCustomer) return "Please select whether you're an existing customer.";
    if (!form.custName.trim()) return "Please enter your name.";
    if (!form.phoneNo.trim()) return "Please enter your phone number.";
    if (!form.email.trim()) return "Please enter your email address.";
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email)) return "Please enter a valid email address.";
    return "";
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/guide-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pkgId, bookingAmount: pkgAmount }),
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
        <h3 className="text-lg font-bold text-slate-900 mb-1">Booking request received!</h3>
        <p className="text-slate-500 text-sm">
          Our team will confirm your guide shortly. Payment is collected in advance via GPay/UPI —
          we&apos;ll share the details on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Booking Details</h2>

      {status === "error" && errorMsg && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <FaTimesCircle /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="frm-label">
            Date of Sightseeing <span className="text-red-500">*</span>
          </label>
          <input type="date" className="modern-input" value={form.dateOfSightseeing} onChange={set("dateOfSightseeing")} />
        </div>
        <div>
          <label className="frm-label">
            Time of Guide Reporting <span className="text-red-500">*</span>
          </label>
          <input type="time" className="modern-input" value={form.timeOfReporting} onChange={set("timeOfReporting")} />
        </div>

        <div>
          <label className="frm-label">
            Hotel of Guide Reporting <span className="text-red-500">*</span>
          </label>
          <select className="modern-input" value={form.hotelOfReporting} onChange={set("hotelOfReporting")}>
            <option value="">--</option>
            {hotels.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
            <option value="Other">Other (specify below)</option>
          </select>
        </div>
        {form.hotelOfReporting === "Other" && (
          <div>
            <label className="frm-label">
              Hotel Name <span className="text-red-500">*</span>
            </label>
            <input className="modern-input" maxLength={100} placeholder="Hotel of Guide Reporting" value={form.otherHotel} onChange={set("otherHotel")} />
          </div>
        )}

        <div>
          <label className="frm-label">
            Guide Language <span className="text-red-500">*</span>
          </label>
          <select className="modern-input" value={form.guideLanguage} onChange={set("guideLanguage")}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="frm-label">
            Number of Person <span className="text-red-500">*</span>
          </label>
          <input type="number" min={1} className="modern-input" placeholder="No. of Person" value={form.numberOfPersons} onChange={set("numberOfPersons")} />
        </div>

        <div>
          <label className="frm-label">
            Existing Customer <span className="text-red-500">*</span>
          </label>
          <select className="modern-input" value={form.existingCustomer} onChange={set("existingCustomer")}>
            <option value="">--</option>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </div>
        <div>
          <label className="frm-label">
            Name <span className="text-red-500">*</span>
          </label>
          <input className="modern-input" maxLength={50} placeholder="Name" value={form.custName} onChange={set("custName")} />
        </div>

        <div>
          <label className="frm-label">
            Phone / WhatsApp No. (10 digit) <span className="text-red-500">*</span>
          </label>
          <input className="modern-input" maxLength={10} placeholder="Phone No." value={form.phoneNo} onChange={set("phoneNo")} />
        </div>
        <div>
          <label className="frm-label">Alternate phone No. (10 digit)</label>
          <input className="modern-input" maxLength={10} placeholder="Alternate phone No." value={form.whatsAppNo} onChange={set("whatsAppNo")} />
        </div>

        <div className="sm:col-span-2">
          <label className="frm-label">
            E-mail Address <span className="text-red-500">*</span>
          </label>
          <input type="email" className="modern-input" maxLength={100} placeholder="E-mail Address" value={form.email} onChange={set("email")} />
        </div>
        <div className="sm:col-span-2">
          <label className="frm-label">Message</label>
          <textarea className="modern-input h-24 resize-none" placeholder="Message" value={form.message} onChange={set("message")} />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full bg-gw-red hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
      >
        {status === "submitting" ? "SENDING..." : "CONFIRM BOOKING"}
      </button>
    </form>
  );
}
