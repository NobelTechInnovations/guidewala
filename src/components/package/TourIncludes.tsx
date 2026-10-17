import type { IconType } from "react-icons";
import { FaCamera, FaCar, FaCheck, FaHotel, FaPlane, FaUserTie, FaUtensils } from "react-icons/fa";
import { INCLUDE_OPTIONS, type IncludeOption } from "@/lib/packages";

const INCLUDE_ICONS: Record<IncludeOption, IconType> = {
  Hotel: FaHotel,
  Meals: FaUtensils,
  Transport: FaCar,
  Sightseeing: FaCamera,
  Guide: FaUserTie,
  Flight: FaPlane,
};

/**
 * "Tour includes" icon row + "Tour highlights" list. Each part only renders
 * with content; the page skips the whole card when both are empty.
 */
export default function TourIncludes({ includes, highlights }: { includes: string[]; highlights: string[] }) {
  // Fixed option order, whatever order the admin ticked them in.
  const shown = INCLUDE_OPTIONS.filter((option) => includes.includes(option));

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      {shown.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Tour includes</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-4">
            {shown.map((option) => {
              const Icon = INCLUDE_ICONS[option];
              return (
                <li key={option} className="flex w-16 flex-col items-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gw-brand/10 text-lg text-gw-brand">
                    <Icon aria-hidden />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{option}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {highlights.length > 0 && (
        <div className={shown.length > 0 ? "border-t border-slate-100 pt-6" : ""}>
          <h2 className="mb-4 font-display text-xl font-semibold text-slate-900">Tour highlights</h2>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gw-brand text-[10px] text-white">
                  <FaCheck aria-hidden />
                </span>
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
