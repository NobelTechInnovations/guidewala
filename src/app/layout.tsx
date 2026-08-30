import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CouponPopupProvider from "@/components/CouponPopup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display face for headings — warm editorial serif that pairs with Inter
// body text, used across hero titles and section headings site-wide.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Guidewala | India's Most Trusted Guide Network",
  description:
    "Connect with Government Approved Local Guides, Book reliable taxis, and stay in a wide choice of hotels across India.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <CouponPopupProvider>
          <Header />
          <div className="flex-grow">{children}</div>
          <Footer />
        </CouponPopupProvider>
      </body>
    </html>
  );
}
