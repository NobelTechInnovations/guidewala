import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FaLightbulb,
  FaRocket,
  FaHeart,
  FaQuoteLeft,
  FaStar,
  FaCheckCircle,
  FaCompass,
} from "react-icons/fa";
import AnimatedCounter from "@/components/AnimatedCounter";

export const metadata: Metadata = {
  title: "About Us | Guidewala",
  description:
    "Guidewala was founded by Bhawani Singh Rathore to digitalize India's tourism sector — connecting travelers with government-approved guides.",
};

const STATS = [
  { target: 45, label: "Team Experience" },
  { target: 2500, label: "Verified Guides" },
  { target: 500, label: "Sites Covered" },
  { target: 10000, label: "Happy Travelers", suffix: "+" },
];

const APPROACH = [
  "We attract travelers looking for authentic experiences.",
  "We connect them with verified local guides.",
  "We simplify online guide booking.",
  "We ensure transparent pricing.",
  "We promote fair compensation for guides.",
  "We help guides focus on what they do best — guiding.",
];

const VALUES = [
  {
    icon: FaLightbulb,
    title: "Our Vision",
    desc: "A rainbow of smooth execution, safe feelings, savings of hard-earned money, security of life, surety of loyal services, simple operating skills, and smart guides & itineraries.",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: FaRocket,
    title: "Our Mission",
    desc: "Global teamwork toward job creation, better quality of life, relationship building, saving heritage and history, developing technology, and spreading awareness among travelers.",
    tone: "bg-green-50 text-gw-brand",
  },
  {
    icon: FaCompass,
    title: "Long Term Goal",
    desc: "Smart AI-driven itineraries, smart check-in/check-out, wallet payments, beacon-based facilitation, and predictive analysis of every traveler's needs.",
    tone: "bg-orange-50 text-orange-500",
  },
];

const TEAM = [
  {
    name: "Jitender Sain",
    role: "Global Head — Business Enablement",
    img: "https://guidewala.in/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-08-at-12.12.11.jpeg",
  },
  {
    name: "Prateek Kumar Sain",
    role: "Head — Business Technology",
    img: "https://guidewala.in/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-08-at-12.12.12.jpeg",
  },
  {
    name: "Sanjeev Sharma",
    role: "Mentor — International Relations",
    img: "https://guidewala.in/wp-content/uploads/2026/07/sanjeev-Sharma.png",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Booking a guide in Jaipur was so easy. Our guide, Ravi, was extremely knowledgeable and polite. Highly recommended!",
    name: "Sarah Jenkins",
    from: "Traveler from UK",
    initial: "S",
    tone: "bg-blue-100 text-blue-600",
  },
  {
    quote:
      "Transparent pricing and great service. The taxi was clean and the driver was professional. A hassle-free experience.",
    name: "Amit Verma",
    from: "Traveler from Delhi",
    initial: "A",
    tone: "bg-green-100 text-gw-brand",
  },
  {
    quote: "Finally a platform that connects us to real government guides. The stories at Taj Mahal came alive for us.",
    name: "Maria Rodriguez",
    from: "Traveler from Spain",
    initial: "M",
    tone: "bg-purple-100 text-purple-600",
  },
];

export default function AboutUsPage() {
  return (
    <main className="overflow-x-hidden">
      {/* Hero */}
      <section
        className="h-[65vh] min-h-[500px] flex items-center justify-center text-center px-6 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,46,22,0.7), rgba(0,46,22,0.9)), url('/assets/img/bg_about_us.jpg')",
        }}
      >
        <div className="relative z-10 max-w-4xl text-white">
          <span className="inline-block py-1 px-4 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
            India&apos;s Trusted Tourist Guide Booking Platform
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-semibold mb-6 leading-tight drop-shadow-lg text-balance">
            We Are <span className="text-gw-brand italic">Guidewala.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto leading-relaxed font-light">
            Connecting government-approved tourist guides with travelers who want to know the real
            story behind every monument.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <p className="text-gray-600 text-lg leading-relaxed">
          Whether you&apos;re exploring the historic streets of Delhi, standing before the timeless
          Taj Mahal, or discovering the Pink City&apos;s royal heritage — Guidewala helps you connect
          with a private tour guide who brings India&apos;s heritage to life, while creating real
          employment opportunities for India&apos;s guide community.
        </p>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gw-dark text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            {STATS.map((s) => (
              <AnimatedCounter key={s.label} target={s.target} label={s.label} suffix={s.suffix} />
            ))}
          </div>
        </div>
      </section>

      {/* Origin story */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative pl-8 pt-8">
            <div className="absolute top-0 left-0 w-3/4 h-3/4 bg-green-50 rounded-3xl -z-10 border border-gw-brand/20" />
            <div className="relative w-full h-[550px]">
              <Image
                src="/assets/img/bhawani-singh.jpg"
                alt="Bhawani Singh"
                fill
                sizes="(min-width:1024px) 45vw, 90vw"
                className="rounded-2xl shadow-2xl object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>

            <div className="absolute bottom-10 -left-4 md:-left-12 bg-white p-8 rounded-xl shadow-xl max-w-xs border-l-4 border-gw-brand">
              <FaQuoteLeft className="text-gw-brand/20 text-3xl mb-2" />
              <p className="text-gw-dark font-display font-semibold text-lg italic leading-snug">
                &ldquo;Dreams turn into holidays when people become tourists.&rdquo;
              </p>
              <p className="text-sm text-gray-500 mt-4 font-bold">— Bhawani Singh, Founder</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gw-brand tracking-widest uppercase mb-4">Our Story</h2>
            <h3 className="font-display text-4xl md:text-5xl font-semibold text-gw-dark mb-8 leading-tight text-balance">
              35 Years of Sailing the
              <br /> Tourism Voyage
            </h3>

            <div className="space-y-6 text-gray-600 text-lg leading-relaxed text-justify">
              <p>
                Guidewala was first envisioned by <strong>Bhawani Singh Rathore</strong>, who began his
                career in tourism in 1988 as a tour executive — commencing at{" "}
                <em>Rajasthan Tours</em> and <em>Rambagh Palace Hotel</em>, and later working with the
                top travel companies of the 1990s: Thomas Cook, Mercury Travels, Cox &amp; Kings, Trade
                Wings, and TCI.
              </p>
              <p>
                In 1996, he took his journey international, joining the luxury travel group{" "}
                <em>Wings for the World Travel Inc.</em> in Toronto, Canada — where he led India
                tourism promotion campaigns with the Department of Tourism, Govt. of India.
              </p>
              <p>
                From there grew a vision: building the digital backbone of Pan-India certified tourist
                guides, bringing every guide into the digital mainstream. So in 2021,{" "}
                <strong>Guidewala</strong> was founded — a unified platform connecting private tour
                guides and travelers through one smart, verified ecosystem. With over 35 years of
                combined experience in tour operations, Guidewala is built by people committed to
                making every tourist&apos;s journey memorable.
              </p>
            </div>

            <div className="mt-10">
              <Image src="/assets/img/logo.png" alt="Guidewala" width={140} height={40} className="h-12 w-auto opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* The Guidewala Difference / Our Approach */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-sm font-bold text-gw-brand tracking-widest uppercase mb-4">
                The Guidewala Difference
              </h2>
              <p className="font-display text-3xl md:text-4xl font-semibold text-gw-dark leading-tight text-balance mb-6">
                Instead of guides finding tourists, we help tourists find guides.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We flipped the traditional model. Our platform puts verified, government-approved
                guides directly in front of the travelers looking for them — with fair, transparent
                terms for both sides.
              </p>
            </div>

            <div className="bg-gw-bg rounded-2xl p-8 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-5">Our Approach</h3>
              <ul className="space-y-3.5">
                {APPROACH.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-slate-600">
                    <FaCheckCircle className="text-gw-brand mt-1 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What drives us */}
      <section className="py-20 bg-gw-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-gw-dark">What Drives Us</h2>
            <p className="text-gray-500 mt-2">The principles that guide our journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${v.tone}`}>
                  <v.icon />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{v.title}</h3>
                <p className="text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-[#002e16] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-gw-brand font-bold tracking-widest text-sm uppercase">Leadership</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2">Meet Team Guidewala</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-12 max-w-3xl mx-auto">
            {TEAM.map((t) => (
              <div key={t.name} className="text-center group">
                <div className="relative w-40 h-40 mx-auto mb-6 rounded-full p-1 border-2 border-gw-brand/50 group-hover:border-gw-brand transition-colors">
                  <Image
                    src={t.img}
                    alt={t.name}
                    fill
                    sizes="160px"
                    className="object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 p-1"
                  />
                </div>
                <h4 className="text-lg font-bold">{t.name}</h4>
                <p className="text-gw-brand text-xs font-bold uppercase tracking-wider mt-1">{t.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/10">
              <Image src="/assets/img/our-guides.jpg" alt="Our Guides" fill sizes="1000px" className="object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <span className="text-3xl font-bold text-white">2500+</span>
                <span className="text-gw-brand text-sm font-bold uppercase tracking-widest">Verified Guides</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-gw-dark">What Travelers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div className="flex text-yellow-400 text-sm mb-4 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${t.tone}`}>
                    {t.initial}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">{t.name}</h5>
                    <p className="text-xs text-gray-500">{t.from}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gw-bg">
        <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gw-brand/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-gw-dark mb-4 text-balance">
              Join Our Growing Community
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              We are bringing the tourism industry together. If you are a certified guide, join us to
              get more assignments and digitalize your profile.
            </p>
            <Link
              href="/guide-registration"
              className="inline-block bg-gw-brand hover:bg-green-700 text-white font-bold py-4 px-12 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Register as Guide
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
