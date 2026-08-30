import type { Metadata } from "next";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Guidewala",
  description: "Get in touch with Guidewala — we respond within 24 hours.",
};

const SOCIALS = [
  { Icon: FaFacebookF, label: "Facebook" },
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaTwitter, label: "Twitter" },
  { Icon: FaLinkedinIn, label: "LinkedIn" },
];

export default function ContactUsPage() {
  return (
    <main>
      <section className="bg-gw-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block bg-white/10 border border-white/20 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            24/7 Support
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond
            as soon as possible.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-gw-brand flex items-center justify-center shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Our Office</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  2nd &amp; 3rd Floor, Office No - 4, Kesari Plaza, Kanta Kalwar Rd, Sindhi Colony
                  Extension, Shivpuri, Jhotwara, Jaipur, Rajasthan 302012
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-gw-brand flex items-center justify-center shrink-0">
                <FaPhoneAlt />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Phone</h4>
                <a href="tel:+919829185267" className="text-sm text-slate-500 hover:text-gw-brand">
                  +91 982 918 5267
                </a>
                <p className="text-xs text-slate-400">Mon-Fri, 9am - 6pm</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-gw-brand flex items-center justify-center shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Email</h4>
                <a href="mailto:booking@guidewala.co.in" className="text-sm text-slate-500 hover:text-gw-brand">
                  booking@guidewala.co.in
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Follow Us</h4>
              <div className="flex gap-3">
                {SOCIALS.map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-gw-brand hover:text-white transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
