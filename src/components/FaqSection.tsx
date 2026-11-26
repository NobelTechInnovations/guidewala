import { getFaqs } from "@/lib/seo.server";
import { jsonLd } from "@/lib/seo";

/**
 * Admin-managed FAQs for one page (Admin → SEO → FAQs) plus FAQPage JSON-LD.
 * Renders nothing when the page has no FAQs. Native <details> keeps it JS-free
 * and fully readable by search engines and AI crawlers.
 */
export default async function FaqSection({ path, title = "Frequently Asked Questions" }: { path: string; title?: string }) {
  const faqs = await getFaqs(path);
  if (faqs.length === 0) return null;

  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section className="py-14 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-slate-900 text-center mb-8">{title}</h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((f, i) => (
            <details key={i} className="group py-4" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                {f.question}
                <span className="text-gw-brand text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
