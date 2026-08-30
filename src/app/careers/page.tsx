import type { Metadata } from "next";
import Link from "next/link";
import { FaLightbulb, FaLandmark, FaChartLine, FaLaptopHouse, FaEnvelope } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Careers | Guidewala",
  description: "Join Team Guidewala — open roles in digital marketing, sales, and tourist facilitation across India.",
};

const CULTURE = [
  { icon: FaLightbulb, title: "Innovation", desc: "Work with latest tech" },
  { icon: FaLandmark, title: "Culture", desc: "Rooted in Indian values" },
  { icon: FaChartLine, title: "Growth", desc: "Limitless potential" },
  { icon: FaLaptopHouse, title: "Flexibility", desc: "Remote & Hybrid options" },
];

const OPENINGS = [
  {
    title: "Digital Marketing Expert",
    desc: "Drive our digital presence. SEO, SEM, and Social Media strategies to connect with travelers worldwide.",
    tag: "Full Time",
  },
  {
    title: "Sales Vendors",
    desc: "Promo Coupon Sales. Expand our partner network with hotels, restaurants, and shops.",
    tag: "Incentive Base",
  },
  {
    title: "Tourist Facilitator / Guide",
    desc: "Freelance Tourist Facilitators. Show the world the beauty of India. Join our verified network.",
    tag: "Freelance",
  },
];

export default function CareersPage() {
  return (
    <main>
      <section
        className="bg-cover bg-center relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,46,22,0.8), rgba(0,46,22,0.85)), url('/assets/img/bg-join-us.jpg')",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-24 text-center text-white">
          <span className="inline-block bg-white/10 border border-white/20 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
            We Are Hiring
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-balance">
            Build the Future of Digital Tourism
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
            Team Guidewala is an open sky of opportunities. Join us in redefining how the world
            explores India.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-balance">
                Limitless Opportunities Await You
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We are looking for passionate individuals to join our mission. Whether you are
                looking for full-time, part-time, incentive-based, or salary-based roles, Guidewala
                offers a platform to grow.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We believe in empowering local talent. From Digital Marketing Experts to Tourist
                Facilitators, every role is crucial in stitching the fabric of Incredible India.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {CULTURE.map((c) => (
                <div key={c.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                  <c.icon className="text-3xl text-gw-brand mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">{c.title}</h4>
                  <p className="text-sm text-slate-500">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-12">
            <span className="text-gw-brand font-bold tracking-widest text-sm uppercase">Join the Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Current Openings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OPENINGS.map((o) => (
              <div key={o.title} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all">
                <span className="inline-block bg-green-50 text-gw-brand text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                  {o.tag}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{o.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gw-dark text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-300 mb-8">
            Send us your CV or register directly on our portal. We can&apos;t wait to meet you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hr@guidewala.co.in"
              className="inline-flex items-center justify-center gap-2 bg-white text-gw-dark font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaEnvelope /> hr@guidewala.co.in
            </a>
            <Link
              href="/guide-registration"
              className="inline-flex items-center justify-center gap-2 bg-gw-brand text-white font-bold px-8 py-3.5 rounded-full hover:bg-green-700 transition-colors"
            >
              Register as Guide
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
