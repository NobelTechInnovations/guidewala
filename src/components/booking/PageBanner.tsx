import Link from "next/link";

export default function PageBanner({ title, crumb }: { title: string; crumb: string }) {
  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(0,46,22,0.88), rgba(0,46,22,0.65)), url('/assets/img/bg_about_us.jpg')",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <nav className="text-sm text-white/70 mb-4 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-white">{crumb}</span>
        </nav>
        <div className="w-10 h-1 bg-gw-brand rounded-full mb-4" />
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-white text-balance">{title}</h1>
      </div>
    </div>
  );
}
