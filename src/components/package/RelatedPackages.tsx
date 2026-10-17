import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";

export interface RelatedView {
  id: number;
  title: string;
  amount: number;
  /** From `existingMediaPath`; null renders the placeholder. */
  image: string | null;
}

/** "More in {city}" cards. */
export default function RelatedPackages({ items }: { items: RelatedView[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((r) => (
        <Link
          key={r.id}
          href={`/packages/${r.id}`}
          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <UploadedImage
              src={r.image}
              alt={r.title}
              sizes="(min-width:640px) 240px, 100vw"
              placeholderLabel={r.title}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="truncate text-sm font-bold text-slate-900">{r.title}</h3>
            <p className="text-sm font-extrabold text-gw-brand">₹{r.amount.toLocaleString("en-IN")}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
