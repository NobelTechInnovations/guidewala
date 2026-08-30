import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FaUserTie, FaTaxi, FaHotel, FaCertificate, FaWallet, FaHeart, FaHandshake, FaStar, FaShieldAlt } from "react-icons/fa";
import FeaturedTours from "@/components/home/FeaturedTours";
import CouponsSection from "@/components/home/CouponsSection";

const DESTINATIONS = [
  { name: "DELHI", img: "/assets/img/delhi.jpg", pkgId: "delhi", fit: "cover" as const },
  { name: "AGRA", img: "/assets/img/agra.jpg", pkgId: "agra", fit: "contain" as const },
  { name: "JAIPUR", img: "/assets/img/jaipur.jpg", pkgId: "jaipur", fit: "cover" as const },
  { name: "UDAIPUR", img: "/assets/img/udaipur.jpg", pkgId: "udaipur", fit: "cover" as const },
  { name: "JODHPUR", img: "/assets/img/jodhpur.jpg", pkgId: "jodhpur", fit: "cover" as const },
  { name: "JAISALMER", img: "/assets/img/jaisalmer.jpg", pkgId: "jaisalmer", fit: "cover" as const },
];

const SERVICES = [
  {
    icon: FaUserTie,
    heading: "Book Your Tour Guide",
    title: "Government Guides",
    desc: "Verified experts for Agra, Jaipur, Delhi and more. Experience history authentically.",
    cta: "Book Now",
    href: "/book-guide",
  },
  {
    icon: FaTaxi,
    heading: "Book Your Taxi",
    title: "Premium Taxi",
    desc: "Safe, sanitized cars for local and outstation trips with professional drivers.",
    cta: "Book Ride",
    href: "/taxi-service",
  },
  {
    icon: FaHotel,
    heading: "Book Your Hotel",
    title: "Heritage Hotels",
    desc: "Best seasonal deals on royal palaces, luxury stays, and budget accommodations.",
    cta: "Reserve Stay",
    href: "/hotel-booking",
  },
];

const DIFFERENTIATORS = [
  {
    icon: FaCertificate,
    title: "100% Verified",
    desc: "Every single guide carries a valid Ministry of Tourism license. Safety and authenticity guaranteed.",
    tone: "green" as const,
  },
  {
    icon: FaWallet,
    title: "Transparent Pricing",
    desc: "No hidden commissions or surprise charges. You pay standard, upfront rates every time.",
    tone: "green" as const,
  },
  {
    icon: FaHeart,
    title: "Passionate Storytelling",
    desc: "We don't just show you places; we share the deep history and legends behind them.",
    tone: "purple" as const,
  },
];

export default function Home() {
  return (
    <main className="text-slate-800">
      {/* Hero */}
      <section
        className="h-[85vh] min-h-[500px] flex items-center justify-center relative text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url('https://images.pexels.com/photos/33797752/pexels-photo-33797752.jpeg')",
        }}
      >
        <div className="text-center px-4 sm:px-6 max-w-5xl w-full">
          <div className="inline-block bg-white/20 backdrop-blur-md border border-white/40 px-4 py-1 md:px-5 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6 shadow-lg">
            #1 Trusted Guide Network
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold mb-4 md:mb-6 leading-tight [text-shadow:0_2px_15px_rgba(0,0,0,0.6)] text-balance">
            Discover India, <br />
            <span className="text-green-400 drop-shadow-md italic">Unfiltered.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto drop-shadow-md font-medium px-2 [text-shadow:0_2px_15px_rgba(0,0,0,0.6)]">
            Connect with Government Approved Local Guides, Book reliable taxis, and stay in a wide
            choice of hotels.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm md:text-base font-semibold [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            <span className="flex items-center gap-1.5">
              <span className="flex text-gw-yellow text-xs gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} />
                ))}
              </span>
              4.8 Rated Service
            </span>
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="text-green-400" /> 100% Verified Guides
            </span>
            <span className="flex items-center gap-1.5">
              <FaHandshake className="text-green-400" /> 10,000+ Happy Travelers
            </span>
          </div>
        </div>
      </section>

      <FeaturedTours />

      {/* Core services */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Core Services
            </h2>
            <div className="w-20 md:w-24 h-1 bg-gw-green mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-4 text-base md:text-lg">
              Expertly Selected Tours &amp; Travels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 group flex flex-col transform hover:-translate-y-2"
              >
                <div className="bg-gw-green h-32 md:h-40 flex flex-col items-center justify-center relative p-4">
                  <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                    <s.icon className="text-gw-green text-lg md:text-xl" />
                  </div>
                  <h3 className="text-white text-xl md:text-2xl font-bold text-center tracking-wide">
                    {s.heading}
                  </h3>
                  <div className="mt-3 bg-gw-yellow text-slate-900 font-extrabold py-1 px-4 md:py-1.5 md:px-6 rounded shadow-sm text-xs md:text-sm tracking-wider uppercase">
                    BOOK NOW
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow text-center items-center">
                  <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{s.title}</h4>
                  <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed">{s.desc}</p>
                  <Link
                    href={s.href}
                    className="text-gw-green font-bold text-sm uppercase tracking-wider flex items-center"
                  >
                    {s.cta}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / differentiators */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative px-2 md:px-4">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="relative aspect-[3/4] translate-y-8 md:translate-y-12">
                  <Image
                    src="/assets/img/jaipur.jpg"
                    alt="Jaipur"
                    fill
                    sizes="(min-width: 768px) 25vw, 45vw"
                    className="rounded-2xl shadow-xl border-4 border-white object-cover"
                  />
                </div>
                <div className="relative aspect-[3/4]">
                  <Image
                    src="/assets/img/udaipur.jpg"
                    alt="Udaipur"
                    fill
                    sizes="(min-width: 768px) 25vw, 45vw"
                    className="rounded-2xl shadow-xl border-4 border-white object-cover"
                  />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-6 py-4 md:px-8 md:py-6 rounded-2xl shadow-2xl text-center border border-slate-100">
                <span className="block text-3xl md:text-4xl font-black text-gw-green mb-1">10k+</span>
                <span className="text-xs md:text-sm text-slate-700 font-bold uppercase tracking-widest">
                  Happy Travelers
                </span>
              </div>
            </div>

            <div className="lg:pl-10 mt-16 lg:mt-0">
              <span className="text-gw-green font-extrabold text-xs md:text-sm uppercase tracking-widest border-l-4 border-gw-green pl-3">
                The Guidewala Difference
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 md:mb-8 leading-tight">
                Not just a tour,
                <br />
                an <span className="text-gw-green">Experience.</span>
              </h2>

              <div className="space-y-6 md:space-y-8">
                {DIFFERENTIATORS.map((d) => (
                  <div key={d.title} className="flex gap-4 md:gap-5 items-start">
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl shrink-0 shadow-sm ${
                        d.tone === "purple" ? "bg-purple-50 text-purple-600" : "bg-green-50 text-gw-green"
                      }`}
                    >
                      <d.icon />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg md:text-xl text-slate-800 mb-1">{d.title}</h4>
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending destinations */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trending Destinations
            </h2>
            <div className="w-20 md:w-24 h-1 bg-gw-green mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.name}
                href={`/packages/${d.pkgId}`}
                className={`relative rounded-2xl overflow-hidden aspect-[3/4] group shadow-md md:shadow-lg border border-slate-200 ${
                  d.fit === "contain" ? "bg-slate-200 flex items-center justify-center p-2" : ""
                }`}
              >
                <Image
                  src={d.img}
                  alt={d.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 45vw"
                  className={`group-hover:scale-110 transition-transform duration-700 ${
                    d.fit === "contain" ? "object-contain" : "object-cover object-center"
                  }`}
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

      <Suspense fallback={null}>
        <CouponsSection />
      </Suspense>

      {/* Guide CTA */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-green-900 opacity-90" />
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 relative z-10 text-white">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 md:mb-6 backdrop-blur shadow-inner">
            <FaHandshake className="text-3xl md:text-4xl text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight">
            Are you a Certified Guide?
          </h2>
          <p className="text-base md:text-xl text-green-50 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Join India&apos;s fastest-growing network. Get consistent assignments, digitalize your
            profile, and grow your career.
          </p>
          <Link
            href="/guide-registration"
            className="bg-gw-yellow text-slate-900 px-8 py-3 md:px-10 md:py-4 rounded-full font-extrabold text-sm md:text-lg shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:bg-yellow-500 hover:scale-105 transition-all duration-300 inline-block uppercase tracking-wide"
          >
            Join Our Network Today
          </Link>
        </div>
      </section>
    </main>
  );
}
