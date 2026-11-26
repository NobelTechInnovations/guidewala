import { Schema, models, model } from "mongoose";

/** Footer "Popular searches" link, e.g. "Guide service in Jaipur" → /book-guide?city=CT001. */
const SeoLinkSchema = new Schema(
  {
    LABEL: { type: String, required: true },
    URL: { type: String, required: true },
    GROUP: { type: String, default: "Popular Searches" }, // footer column heading
    ORDER: { type: Number, default: 0 },
    IS_ACTIVE: { type: String, default: "Y" },
  },
  { collection: "seo_links", timestamps: true }
);

/** Per-URL overrides for title / description / keywords / share image / noindex. */
const SeoPageSchema = new Schema(
  {
    PATH: { type: String, required: true, unique: true, index: true }, // "/", "/book-guide", "/packages/<slug>"
    TITLE: { type: String, default: "" },
    DESCRIPTION: { type: String, default: "" },
    KEYWORDS: { type: String, default: "" }, // comma-separated
    OG_IMAGE: { type: String, default: "" },
    NOINDEX: { type: String, default: "N" },
  },
  { collection: "seo_pages", timestamps: true }
);

/** Question/answer shown on a page (+ FAQPage JSON-LD). PAGE_PATH "*" = every page with an FAQ block. */
const FaqSchema = new Schema(
  {
    QUESTION: { type: String, required: true },
    ANSWER: { type: String, required: true },
    PAGE_PATH: { type: String, default: "/", index: true },
    ORDER: { type: Number, default: 0 },
    IS_ACTIVE: { type: String, default: "Y" },
  },
  { collection: "faqs", timestamps: true }
);

/** Single settings doc (KEY "site") — e.g. the plain-language summary used for AI/GEO (llms.txt). */
const SiteSettingSchema = new Schema(
  {
    KEY: { type: String, required: true, unique: true },
    SITE_SUMMARY: { type: String, default: "" },
  },
  { collection: "site_settings", timestamps: true }
);

export const SeoLink = models.SeoLink || model("SeoLink", SeoLinkSchema);
export const SeoPage = models.SeoPage || model("SeoPage", SeoPageSchema);
export const Faq = models.Faq || model("Faq", FaqSchema);
export const SiteSetting = models.SiteSetting || model("SiteSetting", SiteSettingSchema);
