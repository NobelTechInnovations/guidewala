"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight, FaImages, FaTimes } from "react-icons/fa";
import UploadedImage from "@/components/UploadedImage";

/** Thumbnails beside the cover on desktop; anything beyond is behind "+N photos". */
const MAX_THUMBS = 4;

const BOX = "relative h-64 overflow-hidden rounded-2xl bg-slate-100 sm:h-80 lg:h-[440px]";

/** Grid spans inside the 2x2 thumbnail block, so 1–3 thumbnails still fill it. */
function thumbSpan(count: number, k: number): string {
  if (count === 1) return "col-span-2 row-span-2";
  if (count === 2) return "col-span-2";
  if (count === 3 && k === 0) return "col-span-2";
  return "";
}

/**
 * Package photo header: cover + up to four thumbnails with a lightbox.
 * `images` are already-existing /uploads paths (cover first); with none we
 * show the branded placeholder, with one a full-width hero.
 */
export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const count = images.length;

  /** Opens the lightbox at the clicked button's `data-index`, remembering it to restore focus on close. */
  function onOpen(e: React.MouseEvent<HTMLElement>) {
    openerRef.current = e.currentTarget;
    setActive(Number(e.currentTarget.dataset.index ?? 0));
  }
  const close = useCallback(() => {
    setActive(null);
    openerRef.current?.focus();
  }, []);
  const step = useCallback(
    (delta: number) => setActive((i) => (i === null ? i : (i + delta + count) % count)),
    [count]
  );

  if (count === 0) {
    return (
      <div className={BOX}>
        <UploadedImage src={null} alt={title} sizes="100vw" placeholderLabel={title} />
      </div>
    );
  }

  const thumbs = images.slice(1, 1 + MAX_THUMBS);
  const hidden = count - 1 - thumbs.length;

  return (
    <>
      <div className={`${BOX} ${thumbs.length > 0 ? "md:grid md:grid-cols-4 md:gap-2" : ""}`}>
        <button
          type="button"
          data-index={0}
          onClick={onOpen}
          aria-label={`Open photo 1 of ${count}`}
          className={`group relative block h-full w-full overflow-hidden ${thumbs.length > 0 ? "md:col-span-2" : ""}`}
        >
          <UploadedImage
            src={images[0]}
            alt={title}
            sizes={thumbs.length > 0 ? "(min-width:768px) 50vw, 100vw" : "100vw"}
            preload
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>

        {thumbs.length > 0 && (
          <div className="hidden md:col-span-2 md:grid md:grid-cols-2 md:grid-rows-2 md:gap-2">
            {thumbs.map((src, k) => {
              const index = k + 1;
              const showMore = hidden > 0 && k === thumbs.length - 1;
              return (
                <button
                  key={`${index}-${src}`}
                  type="button"
                  data-index={index}
                  onClick={onOpen}
                  aria-label={showMore ? `Open gallery, ${hidden} more photos` : `Open photo ${index + 1} of ${count}`}
                  className={`group relative overflow-hidden ${thumbSpan(thumbs.length, k)}`}
                >
                  <UploadedImage
                    src={src}
                    alt=""
                    sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {showMore && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-bold text-white">
                      +{hidden} photos
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {count > 1 && (
          <button
            type="button"
            data-index={0}
            onClick={onOpen}
            className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-md md:hidden"
          >
            <FaImages aria-hidden /> View all {count} photos
          </button>
        )}
      </div>

      {active !== null && (
        <Lightbox images={images} index={active} title={title} onClose={close} onStep={step} onSelect={setActive} />
      )}
    </>
  );
}

function Lightbox({
  images,
  index,
  title,
  onClose,
  onStep,
  onSelect,
}: {
  images: string[];
  index: number;
  title: string;
  onClose: () => void;
  onStep: (delta: number) => void;
  onSelect: (index: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  // Lock page scroll and move focus in while open; restore on close.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && count > 1) onStep(-1);
      else if (e.key === "ArrowRight" && count > 1) onStep(1);
      else if (e.key === "Tab") {
        // Focus trap-lite: keep Tab cycling through the dialog's controls.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const inside = dialogRef.current?.contains(document.activeElement);
        if (!inside || (e.shiftKey && document.activeElement === first)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [count, onClose, onStep]);

  /** Clicks on the dark backdrop (not the photo or a control) close the lightbox. */
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      onClick={onBackdrop}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
    >
      <div onClick={onBackdrop} className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <span className="text-sm font-semibold tabular-nums" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg transition-colors hover:bg-white/20"
        >
          <FaTimes aria-hidden />
        </button>
      </div>

      <div onClick={onBackdrop} className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
        {/* Natural-size image (not `fill`) so the empty space around it counts as "outside". */}
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${title} — photo ${index + 1} of ${count}`}
          width={1600}
          height={1067}
          sizes="100vw"
          unoptimized
          className="h-auto max-h-[calc(100dvh-11rem)] w-auto max-w-full rounded-lg object-contain"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 sm:left-5"
            >
              <FaChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 sm:right-5"
            >
              <FaChevronRight aria-hidden />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div onClick={onBackdrop} className="overflow-x-auto px-4 py-4">
          {/* w-max + mx-auto: centred when it fits, scrollable from the first thumb when it doesn't. */}
          <div className="mx-auto flex w-max gap-2">
            {images.map((src, i) => (
              <button
                key={`${i}-${src}`}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md transition-opacity ${
                  i === index ? "opacity-100 ring-2 ring-white" : "opacity-50 hover:opacity-90"
                }`}
              >
                <UploadedImage src={src} alt="" sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
