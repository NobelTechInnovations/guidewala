"use client";

import { useState, FormEvent } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const COUNTRIES = [
  "India", "Australia", "Canada", "France", "Germany", "Japan", "Russia",
  "United Arab Emirates", "United Kingdom", "United States of America",
];

const LANGUAGES = [
  "Hindi", "English", "French", "German", "Spanish", "Italian", "Russian",
  "Mandarin", "Japanese", "Arabic", "Korean", "Gujarati", "Tamil", "Bengali",
];

const CITIES = ["Jaipur", "Delhi", "Agra"];

type Status = "idle" | "submitting" | "success" | "error";

function MultiSelectChips({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              active
                ? "bg-gw-brand text-white border-gw-brand"
                : "bg-slate-50 text-slate-600 border-slate-300 hover:border-gw-brand"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function GuideRegistrationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    pinCode: "",
    state: "",
    country: "India",
  });
  const [languages, setLanguages] = useState<string[]>([]);
  const [expCities, setExpCities] = useState<string[]>([]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const validate = () => {
    if (!form.firstName.trim()) return "Please enter your first name.";
    if (!form.phoneNo.trim()) return "Please enter your phone number.";
    if (!form.email.trim()) return "Please enter your email address.";
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.pinCode.trim()) return "Please enter your PIN code.";
    if (!form.state) return "Please select your state.";
    if (!form.country) return "Please select your country.";
    if (languages.length === 0) return "Please select at least one language you know.";
    if (expCities.length === 0) return "Please select at least one city you have guide experience in.";
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
      const res = await fetch("/api/guide-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, languages, expCities }),
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
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <FaCheckCircle className="text-5xl text-gw-brand mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Registration submitted!</h3>
        <p className="text-slate-500">
          Thanks for registering as a Guidewala guide. Our team will review your details and reach
          out to collect your license &amp; ID proof for verification.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
      {status === "error" && errorMsg && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <FaTimesCircle /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Enter Your First Name"
            maxLength={35}
            value={form.firstName}
            onChange={set("firstName")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
          <input
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Enter Your Last Name"
            maxLength={35}
            value={form.lastName}
            onChange={set("lastName")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="+91-98XXXXXXX8"
            maxLength={12}
            value={form.phoneNo}
            onChange={set("phoneNo")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="example@email.com"
            maxLength={70}
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Address Line 1</label>
          <input
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Street Address"
            maxLength={70}
            value={form.address1}
            onChange={set("address1")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Address Line 2</label>
          <input
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Apartment, suite, etc."
            maxLength={70}
            value={form.address2}
            onChange={set("address2")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="City"
            maxLength={50}
            value={form.city}
            onChange={set("city")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            PIN Code <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Postal Code"
            maxLength={6}
            value={form.pinCode}
            onChange={set("pinCode")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            value={form.state}
            onChange={set("state")}
          >
            <option value="">Select State</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            value={form.country}
            onChange={set("country")}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Language known <span className="text-red-500">*</span>
          </label>
          <MultiSelectChips options={LANGUAGES} selected={languages} onToggle={(v) => toggle(languages, setLanguages, v)} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Experience in guide cities <span className="text-red-500">*</span>
          </label>
          <MultiSelectChips options={CITIES} selected={expCities} onToggle={(v) => toggle(expCities, setExpCities, v)} />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full md:w-auto bg-[#dc3545] hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        {status === "submitting" ? "Submitting..." : "Submit Registration"}
      </button>
    </form>
  );
}
