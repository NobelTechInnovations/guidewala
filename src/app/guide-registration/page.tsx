import type { Metadata } from "next";
import PageBanner from "@/components/booking/PageBanner";
import GuideRegistrationForm from "@/components/GuideRegistrationForm";

export const metadata: Metadata = {
  title: "Guide Registration | Guidewala",
  description: "Register as a government-approved tour guide and join India's fastest-growing guide network.",
};

export default function GuideRegistrationPage() {
  return (
    <main>
      <PageBanner title="Guide Registration" crumb="Guide Registration" />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Join India&apos;s Fastest-Growing Guide Network
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Fill in your details below. Our team will review your registration and reach out to
            complete verification.
          </p>
        </div>

        <GuideRegistrationForm />
      </div>
    </main>
  );
}
