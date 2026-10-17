import { FaClock, FaFilePdf, FaShieldAlt, FaUserTie, FaWhatsapp } from "react-icons/fa";

function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Desktop right-column price + CTA card (also shown inline on mobile, under the title block). */
export default function PriceCard({
  amount,
  priceNote,
  whatsappHref,
  brochureHref,
  policySummary,
}: {
  amount: number;
  priceNote: string;
  whatsappHref: string;
  /** From `existingMediaPath`; null hides the brochure link. */
  brochureHref: string | null;
  policySummary: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="p-6">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Starts from</span>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-3xl font-extrabold text-gw-brand">{rupees(amount)}</span>
          <span className="text-sm text-slate-500">{priceNote}</span>
        </div>

        <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
          <li className="flex items-center gap-3">
            <FaUserTie className="shrink-0 text-gw-brand" aria-hidden /> Government-approved guide
          </li>
          <li className="flex items-center gap-3">
            <FaClock className="shrink-0 text-gw-brand" aria-hidden /> Flexible scheduling
          </li>
        </ul>

        <a
          href="#book"
          className="mt-6 block rounded-xl bg-gw-red py-3.5 text-center font-bold text-white shadow-md transition-colors hover:bg-red-600"
        >
          Book Now
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-gw-brand py-3 font-bold text-gw-brand transition-colors hover:bg-gw-brand hover:text-white"
        >
          <FaWhatsapp className="text-lg" aria-hidden /> Enquire on WhatsApp
        </a>
        {brochureHref && (
          <a
            href={brochureHref}
            download
            className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-gw-brand"
          >
            <FaFilePdf className="text-gw-red" aria-hidden /> Download brochure
          </a>
        )}
      </div>

      <a
        href="#cancellation"
        className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-600 transition-colors hover:text-gw-brand"
      >
        <FaShieldAlt className="shrink-0 text-gw-brand" aria-hidden />
        <span className="line-clamp-2">{policySummary}</span>
        <span className="ml-auto shrink-0 font-semibold underline underline-offset-2">Policy</span>
      </a>
    </div>
  );
}

/**
 * Mobile-only sticky bottom bar. `data-mobile-book-bar` lets globals.css pad
 * the page bottom (body:has(...)) so the bar never covers the footer.
 */
export function MobileBookBar({ amount, priceNote }: { amount: number; priceNote: string }) {
  return (
    <div
      data-mobile-book-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Starts from</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-gw-brand">{rupees(amount)}</span>
            <span className="truncate text-xs text-slate-500">{priceNote}</span>
          </div>
        </div>
        <a
          href="#book"
          className="shrink-0 rounded-xl bg-gw-red px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-600"
        >
          Book Now
        </a>
      </div>
    </div>
  );
}
