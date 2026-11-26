import { Faq, SeoLink, SeoPage } from "@/models";

/** Admin SEO collections editable through /api/admin/seo/<kind>. */
export const SEO_KINDS = {
  links: { model: SeoLink, sort: { GROUP: 1, ORDER: 1, LABEL: 1 } },
  pages: { model: SeoPage, sort: { PATH: 1 } },
  faqs: { model: Faq, sort: { PAGE_PATH: 1, ORDER: 1 } },
} as const;
export type SeoKind = keyof typeof SEO_KINDS;
export const isSeoKind = (k: string): k is SeoKind => k in SEO_KINDS;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const flag = (v: unknown, dflt: "Y" | "N") => (v === "Y" || v === "N" ? v : dflt);
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Site path ("/x") or full http(s) URL — nothing else (no javascript: etc.). */
function cleanUrl(v: unknown): string | null {
  const u = str(v);
  return /^\/(?!\/)/.test(u) || /^https?:\/\/[^\s]+$/i.test(u) ? u : null;
}
/** Path only, no query/hash, no trailing slash (except "/"). */
function cleanPath(v: unknown): string | null {
  const p = str(v).split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return /^\/[^\s]*$/.test(p) ? p : null;
}

/** Validates a create/update body. Returns the document fields or an error message. */
export function parseSeoBody(kind: SeoKind, b: Record<string, unknown>): { doc: Record<string, unknown> } | { error: string } {
  if (kind === "links") {
    const url = cleanUrl(b.url);
    if (!str(b.label)) return { error: "Keyword text is required." };
    if (!url) return { error: 'Link must be a site path like "/book-guide?city=CT001" or a full https:// URL.' };
    return {
      doc: { LABEL: str(b.label), URL: url, GROUP: str(b.group) || "Popular Searches", ORDER: num(b.order), IS_ACTIVE: flag(b.isActive, "Y") },
    };
  }
  if (kind === "pages") {
    const path = cleanPath(b.path);
    if (!path) return { error: 'Page path must start with "/", e.g. "/book-guide".' };
    const image = str(b.ogImage);
    if (image && !cleanUrl(image)) return { error: "Share image must be a site path or https:// URL." };
    return {
      doc: {
        PATH: path,
        TITLE: str(b.title).slice(0, 70),
        DESCRIPTION: str(b.description).slice(0, 170),
        KEYWORDS: str(b.keywords),
        OG_IMAGE: image,
        NOINDEX: flag(b.noindex, "N"),
      },
    };
  }
  const page = str(b.pagePath) === "*" ? "*" : cleanPath(b.pagePath);
  if (!str(b.question) || !str(b.answer)) return { error: "Question and answer are required." };
  if (!page) return { error: 'Page must be a path like "/" or "/book-guide", or "*" for all FAQ pages.' };
  return { doc: { QUESTION: str(b.question), ANSWER: str(b.answer), PAGE_PATH: page, ORDER: num(b.order), IS_ACTIVE: flag(b.isActive, "Y") } };
}
