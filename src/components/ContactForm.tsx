"use client";

import { useState, FormEvent } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.phone.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
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
        <h3 className="text-lg font-bold text-slate-900 mb-1">Message sent!</h3>
        <p className="text-slate-500 text-sm">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Get in Touch</h2>
      <p className="text-sm text-slate-500 mb-6">
        Fill up the form and our Team will get back to you within 24 hours.
      </p>

      {status === "error" && errorMsg && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <FaTimesCircle /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="frm-label">
            First Name <span className="text-red-500">*</span>
          </label>
          <input className="modern-input" placeholder="First Name" value={form.firstName} onChange={set("firstName")} />
        </div>
        <div>
          <label className="frm-label">Last Name</label>
          <input className="modern-input" placeholder="Last Name" value={form.lastName} onChange={set("lastName")} />
        </div>
        <div>
          <label className="frm-label">
            Phone <span className="text-red-500">*</span>
          </label>
          <input className="modern-input" placeholder="Phone" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="frm-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input type="email" className="modern-input" placeholder="Email" value={form.email} onChange={set("email")} />
        </div>
        <div className="sm:col-span-2">
          <label className="frm-label">
            Subject <span className="text-red-500">*</span>
          </label>
          <input className="modern-input" placeholder="Subject" value={form.subject} onChange={set("subject")} />
        </div>
        <div className="sm:col-span-2">
          <label className="frm-label">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea className="modern-input h-32 resize-none" placeholder="Message" value={form.message} onChange={set("message")} />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full bg-gw-brand hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
      >
        {status === "submitting" ? "SENDING..." : "SEND MESSAGE"}
      </button>
    </form>
  );
}
