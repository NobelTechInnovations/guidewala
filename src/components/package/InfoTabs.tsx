"use client";

import { useRef, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export interface InfoTab {
  id: string;
  label: string;
  items: string[];
  kind: "include" | "exclude";
}

function ItemList({ tab }: { tab: InfoTab }) {
  const Icon = tab.kind === "include" ? FaCheckCircle : FaTimesCircle;
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
      {tab.items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
          <Icon aria-hidden className={`mt-0.5 shrink-0 ${tab.kind === "include" ? "text-gw-brand" : "text-gw-red/80"}`} />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Tour Information card: Inclusions / Exclusions as tabs. With a single list
 * there's nothing to switch, so it renders as a plain titled list. All panels
 * stay in the DOM (`hidden`) so the text is indexable.
 */
export default function InfoTabs({ tabs }: { tabs: InfoTab[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (tabs.length === 1) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">{tabs[0].label}</h3>
        <ItemList tab={tabs[0]} />
      </div>
    );
  }

  /** Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation). */
  function onKeyDown(e: React.KeyboardEvent) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div role="tablist" aria-label="Tour information" onKeyDown={onKeyDown} className="flex border-b border-slate-200">
        {tabs.map((tab, i) => {
          const selected = i === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`info-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`info-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`-mb-px flex-1 border-b-2 px-4 py-3.5 text-sm font-bold transition-colors sm:flex-none sm:px-6 ${
                selected ? "border-gw-brand text-gw-brand" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label} <span className="font-medium text-slate-400">({tab.items.length})</span>
            </button>
          );
        })}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`info-panel-${tab.id}`}
          aria-labelledby={`info-tab-${tab.id}`}
          hidden={i !== active}
          className="p-6"
        >
          <ItemList tab={tab} />
        </div>
      ))}
    </div>
  );
}
