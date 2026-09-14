"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaChevronDown,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const SERVICES = [
  { href: "/book-guide", label: "Tour Guide Booking" },
  { href: "/taxi-service", label: "Taxi Booking" },
  { href: "/hotel-booking", label: "Hotel Booking" },
];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/tour-packages", label: "Tour Packages" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-[#002210] text-white text-xs py-2.5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a
            href="https://api.whatsapp.com/send/?phone=919829185267"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-green-400 transition"
          >
            <FaWhatsapp className="text-lg" />
            <span className="hidden sm:inline font-medium">Message us on WhatsApp</span>
          </a>
          <div className="flex items-center gap-6">
            <a
              href="tel:+919829185267"
              className="flex items-center gap-2 font-bold hover:text-green-400"
            >
              <FaPhoneAlt /> +91 982 918 5267
            </a>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/assets/img/logo1.jpeg"
              alt="Guidewala"
              width={160}
              height={48}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}

            <div className="relative group h-20 flex items-center cursor-pointer">
              <span className="nav-link flex items-center gap-1">
                Services <FaChevronDown className="text-[10px] text-gray-400" />
              </span>
              <div className="absolute top-full left-0 w-60 bg-white rounded-b-xl shadow-xl border-t-2 border-gw-brand opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                {SERVICES.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block px-5 py-3 text-sm text-gray-600 hover:bg-green-50 hover:text-gw-brand"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/blog" className="nav-link">
              Blog
            </Link>
            {/* <Link href="/careers" className="nav-link">
              Careers
            </Link> */}
            <Link href="/contact-us" className="nav-link">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/guide-registration"
              className="hidden md:inline-flex items-center gap-2 bg-gw-red text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-red-600 transition-transform hover:scale-105"
            >
              <FaUser /> GUIDE REGISTRATION
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-2xl text-gray-700 p-2"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile offcanvas menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <Image src="/assets/img/logo1.jpeg" alt="Guidewala" width={110} height={32} className="h-8 w-auto" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="text-gray-500 text-xl p-2"
              >
                <FaTimes />
              </button>
            </div>
            <ul className="font-medium space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2.5 text-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="w-full flex justify-between items-center py-2.5 text-gw-brand"
                  onClick={() => setMobileServicesOpen((v) => !v)}
                >
                  Services
                  <FaChevronDown
                    className={`text-xs transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileServicesOpen && (
                  <ul className="pl-4 text-sm text-gray-600 space-y-1">
                    {SERVICES.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          className="block py-2"
                          onClick={() => setMobileOpen(false)}
                        >
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li>
                <Link
                  href="/blog"
                  className="block py-2.5 text-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="block py-2.5 text-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="block py-2.5 text-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact Us
                </Link>
              </li>
              <li className="pt-4">
                <Link
                  href="/guide-registration"
                  className="block bg-gw-red text-white text-center py-2 rounded-md font-bold"
                  onClick={() => setMobileOpen(false)}
                >
                  Guide Registration
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
