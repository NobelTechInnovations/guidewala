"use client";

import { useEffect, useState, FormEvent } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { PageHeader, Card, Field, EmptyState, Loading, inputCls } from "@/components/admin/ui";

type Customer = {
  CUST_ID: string;
  CUST_NAME: string;
  PHONE_NO1: string;
  PHONE_NO2: string;
  EMAIL: string;
  STAY_FROM_DT: string;
  STAY_TO_DT: string;
  ADDRESS: string;
};

const BLANK = { custName: "", phone1: "", phone2: "", email: "", stayFrom: "", stayTo: "", address: "" };

export default function VendorCustomerListPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/vendor/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
      setForm(BLANK);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        title="Customers"
        subtitle="Guests who booked using your promo code"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm"
          >
            {showForm ? <FaTimes /> : <FaPlus />} {showForm ? "Cancel" : "New Customer"}
          </button>
        }
      />

      {showForm && (
        <Card className="p-6 mb-6">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
              <Field label="Name" required>
                <input className={inputCls} value={form.custName} onChange={(e) => setForm({ ...form, custName: e.target.value })} />
              </Field>
              <Field label="Phone No. 1" required>
                <input className={inputCls} value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
              </Field>
              <Field label="Phone No. 2">
                <input className={inputCls} value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
              <Field label="Email Address">
                <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Stay From Date" required>
                <input type="date" className={inputCls} value={form.stayFrom} onChange={(e) => setForm({ ...form, stayFrom: e.target.value })} />
              </Field>
              <Field label="Stay To Date" required>
                <input type="date" className={inputCls} value={form.stayTo} onChange={(e) => setForm({ ...form, stayTo: e.target.value })} />
              </Field>
            </div>
            <Field label="Address" required>
              <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {customers === null ? (
        <Loading />
      ) : customers.length === 0 ? (
        <EmptyState message="No customers yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Stay</th>
                <th className="px-5 py-3">Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.CUST_ID} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-semibold text-slate-800">{c.CUST_NAME}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {c.PHONE_NO1} {c.PHONE_NO2 && `/ ${c.PHONE_NO2}`}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.EMAIL || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {new Date(c.STAY_FROM_DT).toLocaleDateString()} – {new Date(c.STAY_TO_DT).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.ADDRESS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
