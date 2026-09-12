"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CouponPopupProvider from "@/components/CouponPopup";

/**
 * The public site's header, footer, and coupon popup only belong on the
 * public site — the admin panel has its own sidebar shell (AdminShell) and
 * must never show these. Root layout can't just skip them per-route (it
 * wraps every page, admin included), so this client wrapper checks the
 * current path instead.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isVendor = pathname.startsWith("/vendor");

  if (isAdmin || isVendor) return <>{children}</>;

  return (
    <CouponPopupProvider>
      <Header />
      <div className="flex-grow">{children}</div>
      <Footer />
    </CouponPopupProvider>
  );
}
