import Link from "next/link";
import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>{children}</div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "yellow" | "red" | "slate"; children: ReactNode }) {
  const tones = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
    >
      {children}
    </Link>
  );
}

export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gw-brand/30 focus:border-gw-brand";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">{message}</div>
  );
}

export function Loading() {
  return <p className="text-slate-400 px-1">Loading…</p>;
}
