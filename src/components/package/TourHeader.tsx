import { FaArrowRight, FaClock, FaMapMarkerAlt, FaShieldAlt, FaStar } from "react-icons/fa";
import type { RouteStop } from "@/lib/packages";

/** Title block: badges, title, city + rating, route chips and the itinerary jump link. */
export default function TourHeader({
  title,
  cityName,
  tourType,
  duration,
  route,
  itineraryLink,
}: {
  title: string;
  cityName: string;
  tourType?: string;
  /** `durationLabel(...)`; "" hides the badge. */
  duration: string;
  route: RouteStop[];
  /** Label for the #itinerary jump link; omit when there is no itinerary section. */
  itineraryLink?: string;
}) {
  const stops = route.filter((s) => s.CITY?.trim());

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tourType && (
          <span className="rounded-full bg-gw-brand px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            {tourType}
          </span>
        )}
        {duration && (
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
            <FaClock aria-hidden /> {duration}
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-full border border-gw-brand/30 bg-gw-brand/5 px-3 py-1.5 text-xs font-bold text-gw-brand">
          <FaShieldAlt aria-hidden /> Verified Guide
        </span>
      </div>

      <h1 className="font-display text-3xl font-semibold text-balance text-slate-900 md:text-4xl">{title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
        {cityName && (
          <span className="flex items-center gap-1.5 font-medium">
            <FaMapMarkerAlt aria-hidden className="text-gw-brand" /> {cityName}
          </span>
        )}
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <span className="flex gap-0.5 text-xs text-gw-yellow" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar key={i} />
            ))}
          </span>
          4.8 Rated Experience
        </span>
      </div>

      {stops.length > 0 && (
        <ol aria-label="Route" className="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {stops.map((stop, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <FaArrowRight aria-hidden className="text-[10px] text-slate-300" />}
              <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700">
                {stop.CITY}
                {stop.NIGHTS ? <span className="ml-1 font-bold text-gw-brand">{stop.NIGHTS}N</span> : null}
              </span>
            </li>
          ))}
        </ol>
      )}

      {itineraryLink && (
        <a
          href="#itinerary"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gw-brand hover:underline"
        >
          {itineraryLink} <FaArrowRight aria-hidden className="text-xs" />
        </a>
      )}
    </div>
  );
}
