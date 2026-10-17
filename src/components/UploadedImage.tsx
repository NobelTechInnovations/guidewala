import Image from "next/image";
import { FaMapMarkedAlt } from "react-icons/fa";

/**
 * An uploaded photo (served from /uploads/…) that degrades to a styled
 * placeholder when there's no file — legacy records whose images never made it
 * over would otherwise render a broken <img>. Pass the result of
 * `existingMediaPath` (server) or `mediaPath` (client); null means "no image".
 *
 * Client-safe (no fs). Fills its parent, so the parent must be positioned
 * (`relative`) and sized.
 */
export default function UploadedImage({
  src,
  alt,
  sizes,
  className,
  placeholderLabel,
  preload,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  /** Shown under the icon in the placeholder; omit for small thumbnails. */
  placeholderLabel?: string;
  /** Above-the-fold hero image: preload it. */
  preload?: boolean;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-gw-brand/80 to-slate-900 p-3 text-center text-white/90"
      >
        <FaMapMarkedAlt className="shrink-0 text-2xl text-white/80" aria-hidden />
        {placeholderLabel && (
          <span className="line-clamp-2 text-sm font-semibold leading-snug">{placeholderLabel}</span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      preload={preload}
      // Uploads are written after `next build`, so the image optimizer (which
      // only knows files present at build time) answers 400 for them. Serve
      // the file as-is from /uploads instead.
      unoptimized
    />
  );
}
