"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaLock } from "react-icons/fa";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Login failed.");
      // On the admin subdomain, paths are clean (no "/admin" prefix — the
      // middleware maps them internally); on the main domain they need it.
      const isAdminHost = typeof window !== "undefined" && window.location.host.startsWith("admin.");
      router.push(params.get("next") || (isAdminHost ? "/dashboard" : "/admin/dashboard"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <Image src="/assets/img/logo1.png" alt="Guidewala" width={140} height={40} className="h-9 w-auto mb-4" />
          <div className="w-12 h-12 rounded-full bg-green-50 text-gw-brand flex items-center justify-center mb-2">
            <FaLock />
          </div>
          <h1 className="font-display text-xl font-semibold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-500">Guides, vendors, packages, bookings &amp; blog</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <label className="frm-label">Password</label>
        <input
          type="password"
          className="modern-input mb-6"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gw-brand hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
