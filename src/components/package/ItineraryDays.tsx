"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FaBed, FaChevronDown, FaCoffee, FaMoon, FaUtensils } from "react-icons/fa";
import UploadedImage from "@/components/UploadedImage";
import RichText from "./RichText";

export interface DayView {
  id: number;
  dayNo: number;
  title: string;
  desc?: string;
  meals: string[];
  stay?: string;
  /** From `existingMediaPath`; null = no image shown for this day. */
  image: string | null;
}

const MEAL_ICONS: Record<string, IconType> = { Breakfast: FaCoffee, Lunch: FaUtensils, Dinner: FaMoon };

/**
 * Day-wise itinerary accordion on a timeline rail. The first day starts open;
 * collapsed days stay in the DOM (`hidden`) so their text is still indexable.
 */
export default function ItineraryDays({ days }: { days: DayView[] }) {
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set(days.slice(0, 1).map((d) => d.id)));
  const allOpen = days.every((d) => openIds.has(d.id));

  function toggle(id: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {days.length} {days.length === 1 ? "day" : "days"}
        </p>
        <button
          type="button"
          onClick={() => setOpenIds(allOpen ? new Set() : new Set(days.map((d) => d.id)))}
          className="shrink-0 text-sm font-bold text-gw-brand hover:underline"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <ol className="space-y-4">
        {days.map((day, i) => {
          const open = openIds.has(day.id);
          const panelId = `itinerary-day-${day.id}`;
          return (
            <li key={day.id} className="relative pl-8 sm:pl-10">
              {/* Timeline rail + dot */}
              {i < days.length - 1 && (
                <span aria-hidden className="absolute top-6 -bottom-4 left-[7px] w-0.5 bg-gw-brand/20 sm:left-[11px]" />
              )}
              <span
                aria-hidden
                className={`absolute top-5 left-0 h-4 w-4 rounded-full border-4 sm:left-1 ${
                  open ? "border-gw-brand bg-white" : "border-gw-brand/40 bg-white"
                }`}
              />

              <div className={`rounded-2xl border bg-white transition-shadow ${open ? "border-gw-brand/30 shadow-md" : "border-slate-200 shadow-sm"}`}>
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(day.id)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
                  >
                    <span className="shrink-0 rounded-lg bg-gw-brand/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gw-brand">
                      Day {day.dayNo}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold text-slate-900">{day.title}</span>
                    <FaChevronDown
                      aria-hidden
                      className={`shrink-0 text-sm text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                </h3>

                <div id={panelId} hidden={!open} className="border-t border-slate-100 px-4 pt-4 pb-5 sm:px-5">
                  {(day.meals.length > 0 || day.stay) && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                      {day.meals.map((meal) => {
                        const Icon = MEAL_ICONS[meal] ?? FaUtensils;
                        return (
                          <span key={meal} className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">
                            <Icon aria-hidden /> {meal}
                          </span>
                        );
                      })}
                      {day.stay && (
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                          <FaBed aria-hidden className="text-gw-brand" /> Overnight stay: {day.stay}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={day.image ? "flex flex-col gap-4 md:flex-row-reverse md:items-start" : ""}>
                    {day.image && (
                      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 md:w-56">
                        <UploadedImage src={day.image} alt={day.title} sizes="(min-width:768px) 224px, 100vw" className="object-cover" />
                      </div>
                    )}
                    <RichText text={day.desc} small className="min-w-0 flex-1 text-sm leading-relaxed text-slate-600" />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
