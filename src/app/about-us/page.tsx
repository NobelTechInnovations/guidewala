import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaLightbulb, FaRocket, FaHeart, FaQuoteLeft, FaStar } from "react-icons/fa";
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

const VALUES = [
  {
    icon: FaLightbulb,
    title: "Our Vision",
    desc: "To organize the unorganized tourism sector, creating a digital ecosystem where tourists get safety and guides get dignity.",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: FaRocket,
    title: "Our Mission",
    desc: 'To provide "Incredible India" experiences at the tap of a button, ensuring every story told is authentic and every journey safe.',
    tone: "bg-green-50 text-gw-brand",
  },
  {
    icon: FaHeart,
    title: "Core Values",
    desc: "Trust, Transparency, and Tradition. We believe in fair pricing for travelers and fair wages for local experts.",
    tone: "bg-orange-50 text-orange-500",
  },
];

const TEAM = [
  { name: "Bhawani Singh", role: "Founder", img: "/assets/img/bhawani-singh.jpg" },
  { name: "Gaurav Rathore", role: "Co-Founder", sub: "Australia", img: "/assets/img/gaurav-rathore.jpg" },
  { name: "Prakash Rathore", role: "Co-Founder", img: "/assets/img/prakash-rathore.jpg" },
  { name: "Jayendra P. Singh", role: "Mentor", img: "/assets/img/jayendra.jpg" },
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
            Est 2021
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg text-balance">
            We Are <span className="text-gw-brand">Guidewala.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto leading-relaxed font-light">
            Digitalizing India&apos;s tourism with a human touch. Connecting you to the heart of the
            subcontinent.
          </p>
        </div>
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
              <p className="text-gw-dark font-bold text-lg italic leading-snug">
                &ldquo;Dreams turn into holidays when people become tourists.&rdquo;
              </p>
              <p className="text-sm text-gray-500 mt-4 font-bold">— Bhawani Singh, Founder</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gw-brand tracking-widest uppercase mb-4">The Origin Story</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gw-dark mb-8 leading-tight text-balance">
              35 Years of Sailing the
              <br /> Tourism Voyage
            </h3>

            <div className="space-y-6 text-gray-600 text-lg leading-relaxed text-justify">
              <p>
                <strong>Guidewala</strong> was founded by Mr. Bhawani Singh Rathore, a passionate Tourism
                veteran since 1998. Starting his career at the iconic <em>Rajasthan Tours</em> and{" "}
                <em>Rambagh Palace Hotel</em>, he enriched his wisdom by working with industry giants
                like Thomas Cook, Mercury Travels, and Cox &amp; Kings.
              </p>
              <p>
                In 1996, he embarked on an international journey to Canada with the Department of
                Tourism, Govt. of India.
              </p>
              <p>
                In 2023, seeing the unorganized state of the sector post-COVID, <strong>Guidewala</strong>{" "}
                was born. Our mission is simple: to provide a digital platform for tourists to book{" "}
                <strong>Government Approved Guides</strong> securely, ensuring employment for locals and
                authentic experiences for travelers.
              </p>
            </div>

            <div className="mt-10">
              <Image src="/assets/img/logo.png" alt="Guidewala" width={140} height={40} className="h-12 w-auto opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* What drives us */}
      <section className="py-20 bg-gw-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gw-dark">What Drives Us</h2>
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
            <h2 className="text-4xl md:text-5xl font-bold mt-2">Meet Team Guidewala</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
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
                <h4 className="text-xl font-bold">{t.name}</h4>
                {t.sub && <p className="text-gray-400 text-xs mb-1">{t.sub}</p>}
                <p className="text-gw-brand text-xs font-bold uppercase tracking-wider mt-1">{t.role}</p>
              </div>
            ))}

            <div className="text-center lg:col-span-2 flex flex-col justify-center mt-8">
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/10">
                <Image src="/assets/img/our-guides.jpg" alt="Our Guides" fill sizes="600px" className="object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <span className="text-3xl font-bold text-white">2500+</span>
                  <span className="text-gw-brand text-sm font-bold uppercase tracking-widest">Verified Guides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gw-dark">What Travelers Say</h2>
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
            <h2 className="text-3xl md:text-5xl font-bold text-gw-dark mb-4 text-balance">
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
