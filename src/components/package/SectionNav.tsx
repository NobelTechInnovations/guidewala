"use client";

import { useEffect, useRef, useState } from "react";

export interface NavSection {
  id: string;
  label: string;
}

/**
 * Sticky in-page tabs under the site header (h-20). The active tab follows
 * the scroll position: the first section crossing the band between the
 * sticky bars and mid-viewport wins. Sections need a matching scroll margin
 * (`scroll-mt-40`) so a jump doesn't land under the bars.
 */
export default function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const first = sections.find((s) => visible.get(s.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-150px 0px -50% 0px" }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  // On narrow screens the tab row scrolls sideways: keep the active tab in view.
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!nav || !tab) return;
    if (tab.offsetLeft < nav.scrollLeft || tab.offsetLeft + tab.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: tab.offsetLeft - 16 });
    }
  }, [active]);

  function jump(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  }

  return (
    <nav aria-label="Tour sections" className="sticky top-20 z-30 rounded-xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div ref={navRef} className="relative flex overflow-x-auto px-2 [scrollbar-width:none]">
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-section={s.id}
              onClick={(e) => jump(e, s.id)}
              aria-current={isActive ? "location" : undefined}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                isActive ? "border-gw-brand text-gw-brand" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {s.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
