"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { FaTimes } from "react-icons/fa";

type CouponInfo = {
  promoId: string;
  title: string;
  code: string;
  validTo: string;
};

type CouponPopupContextValue = {
  open: (coupon: CouponInfo) => void;
};

const CouponPopupContext = createContext<CouponPopupContextValue | null>(null);

export function useCouponPopup() {
  const ctx = useContext(CouponPopupContext);
  if (!ctx) throw new Error("useCouponPopup must be used within CouponPopupProvider");
  return ctx;
}

export default function CouponPopupProvider({ children }: { children: React.ReactNode }) {
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const open = useCallback((c: CouponInfo) => {
    setCoupon(c);
    setForm({ name: "", phone: "", email: "" });
    setAgreed(false);
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const close = () => setCoupon(null);

  const submit = async () => {
    if (!coupon) return;
    if (!form.name || !form.phone || !form.email) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      setErrorMsg("Please agree to the Terms & Conditions.");
      return;
    }
    setErrorMsg("");
    setStatus("sending");
    try {
      const res = await fetch("/api/coupons/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoId: coupon.promoId,
          name: form.name,
          phone: form.phone,
          email: form.email,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <CouponPopupContext.Provider value={{ open }}>
      {children}

      {coupon && (
        <>
          <div className="masking-coupon" onClick={close} />
          <div className="w-[90%] sm:w-[550px] fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 m-0">Get This Coupon</h3>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-gray-400 hover:text-red-500 cursor-pointer text-xl transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="frm-label">Coupon</label>
                  <input type="text" disabled value={coupon.title} className="modern-input opacity-70" />
                </div>
                <div>
                  <label className="frm-label">Code</label>
                  <input
                    type="text"
                    disabled
                    value={coupon.code}
                    className="modern-input opacity-70 font-mono font-bold text-gw-brand"
                  />
                </div>
                <div className="col-span-2">
                  <label className="frm-label">Validity</label>
                  <input type="text" disabled value={coupon.validTo} className="modern-input opacity-70" />
                </div>

                <div>
                  <label className="frm-label">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    className="modern-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="frm-label">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+91..."
                    className="modern-input"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="frm-label">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="modern-input"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-gw-brand w-4 h-4"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                      I agree to{" "}
                      <a href="/promo-code-terms-conditions" className="text-gw-brand hover:underline">
                        Terms &amp; Conditions
                      </a>
                    </span>
                  </label>
                </div>

                <div className="col-span-2 mt-2">
                  <button
                    type="button"
                    onClick={submit}
                    disabled={status === "sending" || status === "sent"}
                    className="w-full bg-gw-brand hover:bg-[#007a3a] disabled:opacity-60 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-green-900/10"
                  >
                    {status === "sending" ? "SENDING..." : "SEND COUPON NOW"}
                  </button>
                </div>

                <div className="col-span-2 text-center mt-2">
                  {status === "sent" && (
                    <span className="text-green-600 text-sm font-medium block">
                      Coupon sent! Check your email.
                    </span>
                  )}
                  {errorMsg && <span className="text-red-500 text-sm font-medium block">{errorMsg}</span>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </CouponPopupContext.Provider>
  );
}
