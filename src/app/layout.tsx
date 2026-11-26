import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { OG_IMAGE, SITE_LOGO, SITE_NAME, SITE_PHONE, SITE_URL, SOCIAL_LINKS } from "@/lib/site";
import { jsonLd } from "@/lib/seo";
import { getFooterLinks } from "@/lib/seo.server";

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
  metadataBase: new URL(SITE_URL),
  title: "Guidewala | India's Most Trusted Guide Network",
  description:
    "Connect with Government Approved Local Guides, Book reliable taxis, and stay in a wide choice of hotels across India.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

/** Organization + TravelAgency, on every page. */
const ORG_LD = {
  "@context": "https://schema.org",
  "@type": ["Organization", "TravelAgency"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}${SITE_LOGO}`,
  image: `${SITE_URL}${OG_IMAGE}`,
  telephone: SITE_PHONE,
  areaServed: { "@type": "Country", name: "India" },
  founder: { "@type": "Person", name: "Bhawani Singh Rathore" },
  sameAs: Object.values(SOCIAL_LINKS),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const footerLinks = await getFooterLinks();
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ORG_LD)} />
        <SiteChrome footerLinks={footerLinks}>{children}</SiteChrome>
      </body>
    </html>
  );
}
