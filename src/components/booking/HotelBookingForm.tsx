"use client";

import { useState, FormEvent } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ROOM_TYPES = ["A/c", "Non A/c", "Super Deluxe"];
const HOTEL_CATEGORIES = ["Budget Hotel", "Luxury Hotel"];

type Status = "idle" | "submitting" | "success" | "error";

export default function HotelBookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    custName: "",
    email: "",
    phoneNo: "",
    whatsAppNo: "",
    numberOfGuests: "",
    numberOfRooms: "",
    hotelCity: "",
    roomType: "",
    hotelCategory: "",
    arrivalDate: "",
    departureDate: "",
    otherInfo: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.custName.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email address.";
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.phoneNo.trim()) return "Please enter your phone number.";
    if (!form.numberOfGuests.trim()) return "Please enter the number of guests.";
    if (!form.numberOfRooms.trim()) return "Please enter the number of rooms.";
    if (!form.hotelCity.trim()) return "Please enter the city.";
    if (!form.roomType) return "Please select a room type.";
    if (!form.hotelCategory) return "Please select a hotel category.";
    if (!form.arrivalDate) return "Please select an arrival date.";
    if (!form.departureDate) return "Please select a departure date.";
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
      const res = await fetch("/api/hotel-booking", {
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
          Hotel Booking Enquiry has been sent successfully!
        </h3>
        <p className="text-slate-500 text-sm">Thanks for your enquiry — our team will reach out shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Hotel Booking</h2>

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
            No. of Guests <span className="text-red-500">*</span>
          </label>
          <input type="number" min={1} className="modern-input" placeholder="No. of Guests" value={form.numberOfGuests} onChange={set("numberOfGuests")} />
        </div>
        <div>
          <label className="frm-label">
            No. of Rooms <span className="text-red-500">*</span>
          </label>
          <input type="number" min={1} className="modern-input" placeholder="No. of Rooms" value={form.numberOfRooms} onChange={set("numberOfRooms")} />
        </div>
        <div className="sm:col-span-2">
          <label className="frm-label">City where Hotel is required</label>
          <input className="modern-input" maxLength={120} placeholder="City where Hotel is required" value={form.hotelCity} onChange={set("hotelCity")} />
        </div>
        <div>
          <label className="frm-label">
            Room Type <span className="text-red-500">*</span>
          </label>
          <select className="modern-input" value={form.roomType} onChange={set("roomType")}>
            <option value="">--</option>
            {ROOM_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="frm-label">
            Hotel Category <span className="text-red-500">*</span>
          </label>
          <select className="modern-input" value={form.hotelCategory} onChange={set("hotelCategory")}>
            <option value="">--</option>
            {HOTEL_CATEGORIES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="frm-label">
            Arrival Date <span className="text-red-500">*</span>
          </label>
          <input type="date" className="modern-input" value={form.arrivalDate} onChange={set("arrivalDate")} />
        </div>
        <div>
          <label className="frm-label">
            Departure Date <span className="text-red-500">*</span>
          </label>
          <input type="date" className="modern-input" value={form.departureDate} onChange={set("departureDate")} />
        </div>
        <div className="sm:col-span-2">
          <label className="frm-label">Other Information</label>
          <textarea
            className="modern-input h-24 resize-none"
            placeholder="Other Information (Description)"
            value={form.otherInfo}
            onChange={set("otherInfo")}
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
