import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/booking/PageBanner";
import HotelBookingForm from "@/components/booking/HotelBookingForm";

export const metadata: Metadata = {
  title: "Hotel Booking | Guidewala",
  description: "Send a hotel booking enquiry — from budget stays to luxury heritage hotels across India.",
};

export default function HotelBookingPage() {
  return (
    <main>
      <PageBanner title="Hotel Booking" crumb="Hotel Booking" />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HotelBookingForm />
          </div>

          <aside className="space-y-4">
            <Link href="/book-guide" className="block rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative aspect-[4/3]">
              <Image src="/assets/img/book-guide.jpg" alt="Guide Booking" fill sizes="300px" className="object-cover" />
            </Link>
            <Link href="/taxi-service" className="block rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative aspect-[4/3]">
              <Image src="/assets/img/Taxi.jpg" alt="Taxi Booking" fill sizes="300px" className="object-cover" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
