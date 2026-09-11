"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaNewspaper,
  FaUserTie,
  FaUsers,
  FaHotel,
  FaBoxOpen,
  FaTicketAlt,
  FaBook,
  FaTaxi,
  FaBed,
  FaEnvelopeOpenText,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  { title: "", items: [{ href: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt }] },
  {
    title: "Content",
    items: [{ href: "/admin/blog", label: "Blog Posts", icon: FaNewspaper }],
  },
  {
    title: "Bookings & Leads",
    items: [
      { href: "/admin/bookings/guide", label: "Guide Bookings", icon: FaBook },
      { href: "/admin/bookings/taxi", label: "Taxi Bookings", icon: FaTaxi },
      { href: "/admin/bookings/hotel", label: "Hotel Bookings", icon: FaBed },
      { href: "/admin/leads", label: "Coupon Leads", icon: FaEnvelopeOpenText },
    ],
  },
  {
    title: "Guide Master",
    items: [{ href: "/admin/guides", label: "Guide List", icon: FaUserTie }],
  },
  {
    title: "Package Master",
    items: [{ href: "/admin/packages", label: "Packages", icon: FaBoxOpen }],
  },
  {
    title: "Vendor Master",
    items: [
      { href: "/admin/vendors", label: "Vendor List", icon: FaUsers },
      { href: "/admin/vendor-customers", label: "Vendor Customers", icon: FaUsers },
      { href: "/admin/promo-codes", label: "Promo Codes", icon: FaTicketAlt },
    ],
  },
  {
    title: "Hotel Master",
    items: [{ href: "/admin/hotels", label: "Hotel List", icon: FaHotel }],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const sidebar = (
    <nav className="h-full overflow-y-auto py-6 px-3">
      <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 mb-6">
        <span className="font-display text-xl font-bold text-white">
          Guide<span className="text-gw-brand">wala</span>
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Admin</span>
      </Link>
      {NAV.map((group) => (
        <div key={group.title || "root"} className="mb-4">
          {group.title && (
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {group.title}
            </p>
          )}
          {group.items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  active ? "bg-gw-brand text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="shrink-0 text-[13px]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
      <button
        onClick={logout}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white w-full mt-2"
      >
        <FaSignOutAlt className="shrink-0 text-[13px]" /> Log out
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gw-bg flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0 bg-[#0b1120] fixed inset-y-0 left-0">{sidebar}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-[#0b1120]">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0b1120] sticky top-0 z-30">
          <span className="font-display text-lg font-bold text-white">
            Guide<span className="text-gw-brand">wala</span> Admin
          </span>
          <button onClick={() => setMobileOpen(true)} className="text-white p-2">
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
