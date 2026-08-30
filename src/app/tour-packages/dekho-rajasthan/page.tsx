import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaFilePdf,
  FaWhatsapp,
  FaCamera,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "Dekho Rajasthan — 8 Days 7 Nights Tour | Guidewala",
  description:
    "A complete 8-day Rajasthan circuit covering Jaipur, Pushkar, Jaisalmer, Desert Camp, Jodhpur, Udaipur and Chittorgarh — with a government-approved guide throughout.",
};

const ROUTE = ["Jaipur", "Pushkar", "Jaisalmer", "Desert Camp", "Jodhpur", "Udaipur", "Chittorgarh"];

const ITINERARY = [
  {
    day: 1,
    title: "Jaipur",
    desc: "Check in and lunch at hotel. Start half day sightseeing of Amber Fort, Birla Mandir, drive past Jal Mahal. Dinner and overnight stay at hotel.",
  },
  {
    day: 2,
    title: "Jaipur → Pushkar",
    transit: "150 km · 3 hrs drive",
    desc: "Breakfast, then half-day Jaipur sightseeing — City Palace, Jantar Mantar, Albert Hall, driving past Hawa Mahal. After lunch, leave for Pushkar to visit Brahma Ji Temple and the holy lake. Dinner and overnight at hotel.",
  },
  {
    day: 3,
    title: "Pushkar → Jaisalmer",
    transit: "400 km · 7–8 hrs drive",
    desc: "Breakfast, then depart to Jaisalmer by road with lunch en route. Arrive, check in, dinner, and overnight stay at hotel.",
  },
  {
    day: 4,
    title: "Jaisalmer & Desert Camp",
    transit: "50 km · 1 hr drive",
    desc: "Full-day Jaisalmer sightseeing — Gadisar Lake, a walk through Jaisalmer Fort and the old city streets, Patwa Ki Haveli, and the Bada Bagh royal cenotaphs. After lunch, drive to Sam Sand Dunes via the ruins of Kuldhara village. Evening camel safari, sunset over the dunes, and a folk dance dinner around the campfire. Overnight at the desert camp.",
  },
  {
    day: 5,
    title: "Desert Camp → Jodhpur",
    transit: "350 km · 5–6 hrs drive",
    desc: "Breakfast, then departure to Jodhpur. Sightseeing at Mehrangarh Fort, Jaswant Thada, Umaid Bhawan Museum, and a walk through the Clock Tower bazaar. Dinner and overnight stay at hotel.",
  },
  {
    day: 6,
    title: "Jodhpur → Udaipur",
    transit: "300 km · 5–6 hrs drive",
    desc: "Breakfast, then departure to Udaipur via the Ranakpur Jain temples (lunch at Ranakpur). Arrive Udaipur, visit Fateh Sagar Lake. Dinner and overnight stay at hotel.",
  },
  {
    day: 7,
    title: "Udaipur",
    desc: "Full-day Udaipur sightseeing — Jagdish Temple, City Palace Museum, a view of Lake Pichola, Saheliyon Ki Bari, Lok Kala Museum, and the Shilpgram complex, plus a local craft centre visit. Dinner and overnight stay at hotel.",
  },
  {
    day: 8,
    title: "Udaipur → Jaipur",
    transit: "420 km · 7–8 hrs drive",
    desc: "Breakfast, then departure to Jaipur, stopping en route at Chittorgarh Fort for a visit and lunch. Continue to Jaipur city drop point. Tour ends.",
  },
];

const INCLUSIONS = [
  "3 Star Hotels",
  "Twin Sharing Rooms",
  "Breakfast, Lunch & Dinner",
  "Guided Sightseeing Tours",
  "Monument Entry Fees",
  "AC Transportation (Crysta / Coach)",
  "Accompanied Govt. Approved Guide",
  "Jeep Ride at Amber Fort",
  "Camel Safari at Sam Sand Dunes",
  "Cultural Entertainment at Desert Camp",
  "Boat Ride in Udaipur",
  "Laundry — 8 Items per Person",
];

const PRICING = [
  { size: "2 Persons", price: 62500 },
  { size: "4 Persons", price: 54500 },
  { size: "5+ Persons", price: 45000 },
];

const GALLERY = ["r1.jpg", "r2.jpg", "r3.jpg", "r4.jpg", "r5.jpg", "r6.jpg"];

const WHATSAPP_HREF = `https://api.whatsapp.com/send/?phone=919829185267&text=${encodeURIComponent(
  "Hi, I'd like to enquire about the Dekho Rajasthan (8 Days / 7 Nights) tour package."
)}`;

export default function DekhoRajasthanPage() {
  return (
    <main>
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] bg-slate-900">
        <Image
          src="/assets/img/raj/dr.jpg"
          alt="Dekho Rajasthan"
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-6 pb-10 w-full">
            <nav className="text-sm text-white/70 mb-3 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <span>/</span>
              <Link href="/tour-packages" className="hover:text-white transition">
                Tour Packages
              </Link>
              <span>/</span>
              <span className="text-white">Dekho Rajasthan</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 bg-gw-brand text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              8 Days / 7 Nights
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-semibold text-white text-balance max-w-3xl mb-4">
              Dekho Rajasthan
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/85 text-sm font-medium">
              {ROUTE.map((r, i) => (
                <span key={r} className="flex items-center gap-2">
                  {r}
                  {i < ROUTE.length - 1 && <span className="text-white/40">→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* Itinerary */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Day-by-Day Itinerary</h2>
              <div className="space-y-0">
                {ITINERARY.map((d, i) => (
                  <div key={d.day} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gw-brand text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {d.day}
                      </div>
                      {i < ITINERARY.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                    </div>
                    <div className="pb-8">
                      <h3 className="font-bold text-slate-900 mb-0.5">
                        Day {d.day} — {d.title}
                      </h3>
                      {d.transit && (
                        <p className="text-xs font-bold text-gw-brand uppercase tracking-wide mb-2">{d.transit}</p>
                      )}
                      <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900 mb-5">Inclusions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INCLUSIONS.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700"
                  >
                    <FaCheckCircle className="text-gw-brand shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <FaCamera className="text-gw-brand text-lg" /> Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GALLERY.map((img) => (
                  <div key={img} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200">
                    <Image
                      src={`/assets/img/raj/${img}`}
                      alt="Dekho Rajasthan tour"
                      fill
                      sizes="(min-width:640px) 33vw, 50vw"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky sidebar */}
          <div>
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Special Group Pricing
                </span>
                <div className="space-y-2 mb-4">
                  {PRICING.map((p) => (
                    <div key={p.size} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                      <span className="text-sm text-slate-600">{p.size}</span>
                      <span className="font-extrabold text-gw-brand">
                        ₹{p.price.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-400">/person</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mb-6">+ 5% GST as applicable</p>

                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gw-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mb-3"
                >
                  <FaWhatsapp /> Enquire on WhatsApp
                </a>
                <a
                  href="https://guidewala.co.in/dekho-rajasthan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-slate-300 hover:border-gw-brand hover:text-gw-brand text-slate-600 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <FaFilePdf /> Download Full Itinerary (PDF)
                </a>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-gw-brand font-bold text-sm mb-3">
                  <FaShieldAlt /> Why book with Guidewala
                </div>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-gw-brand mt-0.5 shrink-0" /> Government-approved guide throughout
                  </li>
                  <li className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-gw-brand mt-0.5 shrink-0" /> 7 cities, one seamless circuit
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-gw-brand mt-0.5 shrink-0" /> Transparent, all-inclusive pricing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
