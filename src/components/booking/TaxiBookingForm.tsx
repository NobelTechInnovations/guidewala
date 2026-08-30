"use client";

import { useState, FormEvent } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const VEHICLE_TYPES = ["5 Seater", "7 Seater", "9 Seater", "12 Seater"];

type Status = "idle" | "submitting" | "success" | "error";

export default function TaxiBookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    custName: "",
    email: "",
    phoneNo: "",
    whatsAppNo: "",
    numberOfPersons: "",
    city: "",
    address: "",
    dateOfTravel: "",
    vehicleType: "",
    tourPlan: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.custName.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email address.";
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.phoneNo.trim()) return "Please enter your phone number.";
    if (!form.numberOfPersons.trim()) return "Please enter the number of persons.";
    if (!form.city.trim()) return "Please enter the city.";
    if (!form.address.trim()) return "Please enter the address.";
    if (!form.dateOfTravel) return "Please select the date of travel.";
    if (!form.vehicleType) return "Please select the type of vehicle.";
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
      const res = await fetch("/api/taxi-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Taxi Booking Enquiry has been sent successfully!
        </h3>
        <p className="text-slate-500 text-sm">Our team will contact you shortly to confirm your ride.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Personal and Taxi Details</h2>

      {status === "error" && errorMsg && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <FaTimesCircle /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="frm-label">
            Name <span className="text-red-500">*</span>
          </label>
          <input className="modern-input" maxLength={50} placeholder="Name" value={form.custName} onChange={set("custName")} />
        </div>
        <div>
          <label className="frm-label">
            E-mail Address <span className="text-red-500">*</span>
          </label>
          <input type="email" className="modern-input" maxLength={100} placeholder="E-mail Address" value={form.email} onChange={set("email")} />
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
        <div>
          <label className="frm-label">
            Number of Person <span className="text-red-500">*</span>
          </label>
          <input type="number" min={1} className="modern-input" placeholder="No. of Person" value={form.numberOfPersons} onChange={set("numberOfPersons")} />
        </div>
        <div>
          <label className="frm-label">
            City <span className="text-red-500">*</span>
          </label>
          <input className="modern-input" maxLength={100} placeholder="City" value={form.city} onChange={set("city")} />
        </div>
        <div className="sm:col-span-2">
          <label className="frm-label">Address</label>
          <input className="modern-input" maxLength={250} placeholder="Address" value={form.address} onChange={set("address")} />
        </div>
        <div>
          <label className="frm-label">
            Date of Travel <span className="text-red-500">*</span>
          </label>
          <input type="date" className="modern-input" value={form.dateOfTravel} onChange={set("dateOfTravel")} />
        </div>
        <div>
          <label className="frm-label">
            Type of Vehicle <span className="text-red-500">*</span>
          </label>
          <select className="modern-input" value={form.vehicleType} onChange={set("vehicleType")}>
            <option value="">--</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="frm-label">Tour plan</label>
          <textarea
            className="modern-input h-24 resize-none"
            placeholder="Tour plan (Description)"
            value={form.tourPlan}
            onChange={set("tourPlan")}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full bg-gw-red hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
      >
        {status === "submitting" ? "SENDING..." : "SEND ENQUIRY"}
      </button>
    </form>
  );
}
