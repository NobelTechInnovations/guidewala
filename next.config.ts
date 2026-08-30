import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray package-lock.json two levels up
  // (an unrelated sibling client project) otherwise confuses detection.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Guide photos / license scans are served from the admin panel domain —
      // matches the source app's `imgPath` app setting.
      { protocol: "https", hostname: "admin.guidewala.co.in" },
    ],
  },

  // Preserve SEO / bookmarks for the old .aspx URLs from the ASP.NET site.
  async redirects() {
    return [
      { source: "/index.aspx", destination: "/", permanent: true },
      { source: "/about-us.aspx", destination: "/about-us", permanent: true },
      { source: "/book-guide.aspx", destination: "/book-guide", permanent: true },
      { source: "/taxi-service.aspx", destination: "/taxi-service", permanent: true },
      { source: "/hotel-booing.aspx", destination: "/hotel-booking", permanent: true },
      { source: "/careers.aspx", destination: "/careers", permanent: true },
      { source: "/contact-us.aspx", destination: "/contact-us", permanent: true },
      { source: "/guide-registration.aspx", destination: "/guide-registration", permanent: true },
      { source: "/privacy-policy.aspx", destination: "/privacy-policy", permanent: true },
      {
        source: "/terms-and-conditions.aspx",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      { source: "/all-coupons.aspx", destination: "/coupons", permanent: true },
      { source: "/promo-code-terms-conditions.aspx", destination: "/coupons", permanent: true },
      // Old package-details.aspx?id=<encrypted> links can't map to a specific
      // package (the ID was encrypted client-side) — send visitors to browse instead.
      { source: "/package-details.aspx", destination: "/book-guide", permanent: false },
      { source: "/guide-details.aspx", destination: "/guide-registration", permanent: false },
      { source: "/paymentsuccess.aspx", destination: "/", permanent: false },
      { source: "/paymentfail.aspx", destination: "/", permanent: false },
      { source: "/paymentcancel.aspx", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
