import PageBanner from "@/components/booking/PageBanner";

export default function LegalPage({
  title,
  crumb,
  children,
}: {
  title: string;
  crumb: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <PageBanner title={title} crumb={crumb} />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">{title} of Guidewala</h2>
        <div className="space-y-6 text-slate-600 leading-relaxed text-justify [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-2 [&_h4]:font-bold [&_h4]:text-slate-800 [&_h4]:mt-4 [&_h4]:mb-1">
          {children}
        </div>
      </div>
    </main>
  );
}
