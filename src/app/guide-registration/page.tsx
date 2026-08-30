import type { Metadata } from "next";
import { FaClock, FaShieldAlt, FaHandshake } from "react-icons/fa";
import PageBanner from "@/components/booking/PageBanner";
import GuideRegistrationForm from "@/components/GuideRegistrationForm";

export const metadata: Metadata = {
  title: "Guide Registration | Guidewala",
  description: "Register as a government-approved tour guide in under 2 minutes and join India's fastest-growing guide network.",
};

const REASSURANCE = [
  { icon: FaClock, text: "Takes under 2 minutes" },
  { icon: FaShieldAlt, text: "Your details stay private" },
  { icon: FaHandshake, text: "We'll call you to verify" },
];

export default function GuideRegistrationPage() {
  return (
    <main>
      <PageBanner title="Guide Registration" crumb="Guide Registration" />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-900 mb-3 text-balance">
            Join India&apos;s Fastest-Growing Guide Network
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto mb-6">
            Three quick steps — no documents needed yet. We&apos;ll reach out to collect your
            license once you&apos;re registered.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
            {REASSURANCE.map((r) => (
              <span key={r.text} className="flex items-center gap-2">
                <r.icon className="text-gw-brand" /> {r.text}
              </span>
            ))}
          </div>
        </div>

        <GuideRegistrationForm />
      </div>
    </main>
  );
}
