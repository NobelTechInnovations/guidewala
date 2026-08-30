import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/booking/PageBanner";
import TaxiBookingForm from "@/components/booking/TaxiBookingForm";

export const metadata: Metadata = {
  title: "Taxi Booking | Guidewala",
  description: "Send an enquiry for safe, sanitized taxi service anywhere in India.",
};

export default function TaxiServicePage() {
  return (
    <main>
      <PageBanner title="Taxi Service" crumb="Taxi Service" />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TaxiBookingForm />
          </div>

          <aside className="space-y-4">
            <Link href="/book-guide" className="block rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative aspect-[4/3]">
              <Image src="/assets/img/book-guide.jpg" alt="Guide Booking" fill sizes="300px" className="object-cover" />
            </Link>
            <Link href="/hotel-booking" className="block rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative aspect-[4/3]">
              <Image src="/assets/img/hotel-booking.jpg" alt="Hotel Booking" fill sizes="300px" className="object-cover" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
