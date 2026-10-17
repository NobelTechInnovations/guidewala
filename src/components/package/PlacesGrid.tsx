import UploadedImage from "@/components/UploadedImage";
import RichText from "./RichText";

export interface PlaceView {
  id: number;
  title: string;
  desc?: string;
  /** From `existingMediaPath`; null renders the placeholder. */
  image: string | null;
}

/** Card grid for itinerary items without a day number ("Places you'll visit" / "Also included"). */
export default function PlacesGrid({ items }: { items: PlaceView[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <UploadedImage
              src={item.image}
              alt={item.title}
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              placeholderLabel={item.title}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-5">
            <h3 className="mb-1 font-bold text-slate-900">{item.title}</h3>
            <RichText text={item.desc} small className="text-sm leading-relaxed text-slate-500" />
          </div>
        </article>
      ))}
    </div>
  );
}
