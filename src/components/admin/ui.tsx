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

/** A titled card for one group of form fields. */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6 mb-5">
      <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      <div className="mt-4">{children}</div>
    </Card>
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

/**
 * Accessible on/off switch (the visible label is the switch's accessible
 * name). Brand green when on. Only usable from client components.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gw-brand/40 disabled:opacity-60"
    >
      <span
        aria-hidden
        className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-gw-brand" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
      {label}
    </button>
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
