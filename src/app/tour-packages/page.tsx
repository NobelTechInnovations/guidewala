import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/booking/PageBanner";
import { FaMapMarkedAlt } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Tour Packages | Guidewala",
  description: "Explore our curated tour packages across Delhi, Agra, Jaipur, Udaipur, Jodhpur, Jaisalmer, and special heritage & pilgrimage circuits.",
};

const CITY_PACKAGES = [
  { name: "Delhi", tagline: "The Heart of Incredible India", img: "/assets/img/delhi.jpg", cityId: "CT003" },
  { name: "Agra", tagline: "Home of the Timeless Taj Mahal", img: "/assets/img/agra.jpg", cityId: "CT002" },
  { name: "Udaipur", tagline: "The Enchanting City of Lakes", img: "/assets/img/udaipur.jpg", cityId: "CT005" },
  { name: "Jodhpur", tagline: "The Majestic Blue City", img: "/assets/img/jodhpur.jpg", cityId: "CT006" },
  { name: "Jaisalmer", tagline: "Gateway to the Golden Desert", img: "/assets/img/jaisalmer.jpg", cityId: "CT007" },
  { name: "Jaipur", tagline: "The Royal Pink City", img: "/assets/img/jaipur.jpg", cityId: "CT001" },
];

const SPECIAL_PACKAGES = [
  {
    name: "Bharat Bhagwat Bhoomi",
    tagline: "21 Days Spiritual Tour",
    desc: "A pan-India pilgrimage circuit connecting sacred sites across the subcontinent — for travelers seeking a deeper, spiritual journey through India's heritage.",
    img: "/bharat-bhumi.jpg",
  },
  {
    name: "Andaman Tour",
    tagline: "4 Nights / 5 Days",
    desc: "Pristine beaches, coral reefs, and colonial history — a relaxed island getaway with guided sightseeing across Port Blair and Havelock.",
    img: "https://guidewala.in/wp-content/uploads/2026/07/Corbyns-cove-1.jpg",
  },
  {
    name: "North India Explorer",
    tagline: "Classic 9 Days / 8 Nights",
    desc: "A comprehensive circuit through Delhi, Agra, Jaipur, and Amritsar — covering the Golden Triangle plus the Golden Temple experience.",
    img: "https://guidewala.in/wp-content/uploads/2026/07/amritsar-1.jpeg",
  },
];

export default function TourPackagesPage() {
  return (
    <main>
      <PageBanner title="Tour Packages" crumb="Tour Packages" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-slate-900 mb-3 text-balance">
            Best Tour Packages in India for Every Traveler
          </h1>
          <p className="text-slate-500">
            Handpicked guided experiences across India&apos;s most iconic cities, plus special
            heritage and pilgrimage circuits.
          </p>
        </div>

        {/* City packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {CITY_PACKAGES.map((c) => (
            <Link
              key={c.name}
              href={`/book-guide?city=${c.cityId}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all border border-slate-200"
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <h3 className="font-display text-2xl font-semibold mb-1">{c.name}</h3>
                <p className="text-sm text-white/80">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Special packages */}
        <div className="text-center mb-10">
          <span className="text-gw-brand font-bold text-xs uppercase tracking-widest">Beyond the Usual</span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-slate-900 mt-2">
            Special Heritage &amp; Pilgrimage Tours
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SPECIAL_PACKAGES.map((p) => (
            <div
              key={p.name}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative aspect-video">
                <Image src={p.img} alt={p.name} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
                <span className="absolute top-4 left-4 bg-gw-brand text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                  {p.tagline}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">{p.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-grow mb-5">{p.desc}</p>
                <a
                  href={`https://api.whatsapp.com/send/?phone=919829185267&text=${encodeURIComponent(
                    `Hi, I'd like to enquire about the ${p.name} package.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gw-red hover:bg-red-600 text-white font-bold py-3 rounded-lg text-sm transition-colors"
                >
                  <FaMapMarkedAlt /> Enquire Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
