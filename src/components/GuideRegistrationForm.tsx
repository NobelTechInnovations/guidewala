"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { FaCheckCircle, FaTimesCircle, FaArrowRight, FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";

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

// Quick-add suggestions shown under the free-text city input below — a
// starting point, not a limit, since guides can type any city they like.
const SUGGESTED_CITIES = [
  "Jaipur", "Delhi", "Agra", "Udaipur", "Jodhpur", "Jaisalmer", "Pushkar", "Mumbai", "Goa", "Varanasi",
];

const STEPS = [
  { label: "You" },
  { label: "Location" },
  { label: "Expertise" },
];

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
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
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

function CityTagInput({
  selected,
  onAdd,
  onRemove,
}: {
  selected: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value) onAdd(value);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && selected.length > 0) {
      onRemove(selected[selected.length - 1]);
    }
  };

  const suggestions = SUGGESTED_CITIES.filter((c) => !selected.includes(c));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-gw-brand/30 focus-within:border-gw-brand transition-all">
        {selected.map((city) => (
          <span
            key={city}
            className="flex items-center gap-1.5 bg-gw-brand text-white text-sm font-medium pl-3 pr-2 py-1.5 rounded-full"
          >
            {city}
            <button
              type="button"
              onClick={() => onRemove(city)}
              className="hover:bg-white/20 rounded-full p-0.5"
              aria-label={`Remove ${city}`}
            >
              <FaTimes className="text-[10px]" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] bg-transparent outline-none text-base text-slate-700 py-1.5"
          placeholder={selected.length ? "Add another city…" : "Type a city and press Enter"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onAdd(city)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate-500 hover:border-gw-brand hover:text-gw-brand transition-colors"
            >
              <FaPlus className="text-[9px]" /> {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-slate-50 border border-slate-300 text-slate-700 py-3.5 px-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gw-brand/30 focus:border-gw-brand transition-all";

export default function GuideRegistrationForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showAddress, setShowAddress] = useState(false);
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

  const addCity = (city: string) =>
    setExpCities((prev) => (prev.some((c) => c.toLowerCase() === city.toLowerCase()) ? prev : [...prev, city]));
  const removeCity = (city: string) => setExpCities((prev) => prev.filter((c) => c !== city));

  const validateStep = (s: number) => {
    if (s === 0) {
      if (!form.firstName.trim()) return "Please enter your first name.";
      if (!form.phoneNo.trim()) return "Please enter your phone number.";
      if (!form.email.trim()) return "Please enter your email address.";
      if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email)) return "Please enter a valid email address.";
    }
    if (s === 1) {
      if (!form.city.trim()) return "Please enter your city.";
      if (!form.pinCode.trim()) return "Please enter your PIN code.";
      if (!form.state) return "Please select your state.";
      if (!form.country) return "Please select your country.";
    }
    if (s === 2) {
      if (languages.length === 0) return "Please select at least one language you know.";
      if (expCities.length === 0) return "Please select at least one city you have guide experience in.";
    }
    return "";
  };

  const goBack = () => {
    setErrorMsg("");
    setStep((s) => s - 1);
  };

  const submitRegistration = async () => {
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

  // Single dispatcher for the form's onSubmit — both the "Continue" and
  // "Submit Registration" buttons are type="submit" so Enter naturally
  // advances the wizard too. This reads `step` fresh at submit time rather
  // than relying on which button's type happened to be rendered, which
  // avoids a race where a click lands as a native form submit a render
  // behind (advancing two steps at once with a stale validation target).
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      const err = validateStep(step);
      if (err) {
        setErrorMsg(err);
        return;
      }
      setErrorMsg("");
      setStep((s) => s + 1);
    } else {
      const err = validateStep(step);
      if (err) {
        setErrorMsg(err);
        return;
      }
      submitRegistration();
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <FaCheckCircle className="text-5xl text-gw-brand mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">Registration submitted!</h3>
        <p className="text-slate-500">
          Thanks for registering as a Guidewala guide. Our team will review your details and reach
          out to collect your license &amp; ID proof for verification.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  i < step
                    ? "bg-gw-brand text-white"
                    : i === step
                    ? "bg-gw-brand text-white ring-4 ring-green-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? <FaCheckCircle /> : i + 1}
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${i <= step ? "text-slate-800" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full transition-colors ${i < step ? "bg-gw-brand" : "bg-slate-100"}`} />
            )}
          </div>
        ))}
      </div>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-6">
        Step {step + 1} of {STEPS.length} · About 30 seconds each
      </p>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <FaTimesCircle /> {errorMsg}
        </div>
      )}

      {/* Step 1 — You */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="Enter your first name"
                maxLength={35}
                value={form.firstName}
                onChange={set("firstName")}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input
                className={inputClass}
                placeholder="Enter your last name"
                maxLength={35}
                value={form.lastName}
                onChange={set("lastName")}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              className={inputClass}
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
              inputMode="email"
              className={inputClass}
              placeholder="you@example.com"
              maxLength={70}
              value={form.email}
              onChange={set("email")}
            />
          </div>
        </div>
      )}

      {/* Step 2 — Location */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="Which city are you based in?"
                maxLength={50}
                value={form.city}
                onChange={set("city")}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                inputMode="numeric"
                className={inputClass}
                placeholder="302012"
                maxLength={6}
                value={form.pinCode}
                onChange={set("pinCode")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select className={inputClass} value={form.state} onChange={set("state")}>
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
              <select className={inputClass} value={form.country} onChange={set("country")}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!showAddress ? (
            <button
              type="button"
              onClick={() => setShowAddress(true)}
              className="flex items-center gap-2 text-sm font-bold text-gw-brand hover:underline"
            >
              <FaPlus className="text-xs" /> Add street address (optional)
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address Line 1</label>
                <input
                  className={inputClass}
                  placeholder="Street address"
                  maxLength={70}
                  value={form.address1}
                  onChange={set("address1")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address Line 2</label>
                <input
                  className={inputClass}
                  placeholder="Apartment, suite, etc."
                  maxLength={70}
                  value={form.address2}
                  onChange={set("address2")}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Expertise */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Which languages do you speak? <span className="text-red-500">*</span>
            </label>
            <MultiSelectChips options={LANGUAGES} selected={languages} onToggle={(v) => toggle(languages, setLanguages, v)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Which cities do you have guiding experience in? <span className="text-red-500">*</span>
            </label>
            <CityTagInput selected={expCities} onAdd={addCity} onRemove={removeCity} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm px-2 py-2 transition-colors"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#dc3545] hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Continue <FaArrowRight className="text-xs" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === "submitting"}
            className="flex items-center gap-2 bg-[#dc3545] hover:bg-red-700 disabled:opacity-60 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {status === "submitting" ? "Submitting..." : "Submit Registration"}
          </button>
        )}
      </div>
    </form>
  );
}
