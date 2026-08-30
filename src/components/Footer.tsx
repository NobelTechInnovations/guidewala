import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const COMPANY_LINKS = [
  { href: "/about-us", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
];

const SERVICE_LINKS = [
  { href: "/book-guide", label: "Tour Guide Booking" },
  { href: "/taxi-service", label: "Taxi Booking" },
  { href: "/hotel-booking", label: "Hotel Booking" },
  { href: "/guide-registration", label: "Guide Registration" },
];

const SOCIAL_LINKS = [
  { href: "#", Icon: FaFacebookF, label: "Facebook" },
  { href: "#", Icon: FaInstagram, label: "Instagram" },
  { href: "#", Icon: FaTwitter, label: "Twitter" },
  { href: "#", Icon: FaLinkedinIn, label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="bg-[#002e16] text-white pt-20 pb-8 mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Image
              src="/assets/img/logo.png"
              alt="Guidewala"
              width={140}
              height={40}
              className="h-10 w-auto brightness-0 invert opacity-90"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              <strong>G8 Guidewala Services LLP</strong>
              <br />
              We make your travel seamless with verified guides, premium taxis, and heritage
              stays across India.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ href, Icon, label }) => (
                <a key={label} href={href} aria-label={label} className="social-icon">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Company</h4>
            <ul className="space-y-1">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Services</h4>
            <ul className="space-y-1">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Get in Touch</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-gw-brand" />
                <span>
                  2nd &amp; 3rd Floor, Office No - 4, Kesari Plaza, Kanta Kalwar Rd, Sindhi Colony
                  Extension, Shivpuri, Jhotwara, Jaipur, Rajasthan 302012
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-gw-brand" />
                <a href="tel:+919829185267" className="hover:text-white transition">
                  +91 982 918 5267
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-gw-brand" />
                <a href="mailto:booking@guidewala.co.in" className="hover:text-white transition">
                  booking@guidewala.co.in
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <a
                href="https://play.google.com/store/apps/details?id=com.kritikainfotech.guidewala&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition"
              >
                <Image
                  src="/assets/img/google-play.png"
                  alt="Get it on Google Play"
                  width={140}
                  height={40}
                  className="h-10 w-auto border border-white/20 rounded-md"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Guidewala Services LLP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
