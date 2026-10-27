import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import { destinationsFrom, getActivePackages } from "@/lib/destinations";

/** Cities that currently have active packages — driven entirely by the database. */
export default async function TrendingDestinations() {
  const destinations = destinationsFrom(await getActivePackages());
  if (destinations.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Trending Destinations</h2>
          <div className="w-20 md:w-24 h-1 bg-gw-green mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5 justify-center">
          {destinations.map((d) => (
            <Link
              key={d.cityId}
              href={`/book-guide?city=${d.cityId}`}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] group shadow-md md:shadow-lg border border-slate-200"
            >
              <UploadedImage
                src={d.img}
                alt={d.name}
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 45vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <span className="absolute bottom-3 md:bottom-4 left-0 w-full text-center text-white font-bold tracking-widest text-sm md:text-lg drop-shadow-md uppercase z-10">
                {d.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
