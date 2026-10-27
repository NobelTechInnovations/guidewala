import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";
import PageBanner from "@/components/booking/PageBanner";
import UploadedImage from "@/components/UploadedImage";
import { getActivePackages } from "@/lib/destinations";
import { durationLabel } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Tour Packages | Guidewala",
  description: "Explore Guidewala's guided tour packages across India.",
};

// Packages are managed in admin, so list whatever is active right now.
export const dynamic = "force-dynamic";

export default async function TourPackagesPage() {
  const packages = await getActivePackages();

  return (
    <main>
      <PageBanner title="Tour Packages" crumb="Tour Packages" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-slate-900 mb-3 text-balance">
            Best Tour Packages in India for Every Traveler
          </h1>
          <p className="text-slate-500">Handpicked guided experiences with government-approved guides.</p>
        </div>

        {packages.length === 0 ? (
          <p className="text-center text-slate-400">New tour packages are coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((p) => {
              const duration = durationLabel(p.DURATION_DAYS, p.DURATION_NIGHTS);
              return (
                <Link
                  key={p.PKG_ID}
                  href={`/packages/${p.PKG_ID}`}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <UploadedImage
                      src={p.imageSrc}
                      alt={p.TITLE_NAME || "Tour package"}
                      placeholderLabel={p.TITLE_NAME}
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {duration && (
                      <span className="absolute top-3 left-3 bg-gw-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                        {duration}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-900 leading-snug mb-2">{p.TITLE_NAME}</h3>
                    {p.CITY_NAME && (
                      <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                        <FaMapMarkerAlt className="text-gw-brand" /> {p.CITY_NAME}
                      </p>
                    )}
                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Starting from</span>
                        <span className="text-gw-brand font-extrabold text-lg">
                          ₹{(p.PKG_AMOUNT || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-gw-red uppercase tracking-wide">
                        View <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
