"use client";

import { useEffect, useState, use } from "react";
import { PageHeader, Loading } from "@/components/admin/ui";
import PackageForm, { PackageFormValues, MissingMedia } from "@/components/admin/PackageForm";
import { PackageDoc, htmlToText, isShown, listToLines, looksLikeHtml } from "@/lib/packages";

/** Stored number -> form string; missing -> blank. */
const num = (n?: number) => (typeof n === "number" ? String(n) : "");

/** API document -> form values (lists as one-per-line text; missing fields empty / shown). */
function toFormValues(pkg: PackageDoc): PackageFormValues {
  const desc = pkg.PKG_DESC ?? "";
  return {
    title: pkg.TITLE_NAME ?? "",
    cityId: pkg.CITY_ID ?? "",
    amount: num(pkg.PKG_AMOUNT),
    // Legacy descriptions are HTML; the form edits plain text.
    desc: looksLikeHtml(desc) ? htmlToText(desc) : desc,
    isActive: isShown(pkg.IS_ACTIVE) ? "Y" : "N",
    showOnHome: isShown(pkg.SHOW_ON_HOME) ? "Y" : "N",
    priceNote: pkg.PRICE_NOTE ?? "",
    tourType: pkg.TOUR_TYPE ?? "",
    durationDays: num(pkg.DURATION_DAYS),
    durationNights: num(pkg.DURATION_NIGHTS),
    route: (pkg.ROUTE ?? []).map((s) => ({ city: s.CITY ?? "", nights: num(s.NIGHTS) })),
    includes: pkg.INCLUDES ?? [],
    highlights: listToLines(pkg.HIGHLIGHTS),
    inclusions: listToLines(pkg.INCLUSIONS),
    exclusions: listToLines(pkg.EXCLUSIONS),
    documents: listToLines(pkg.DOCUMENTS),
    thingsToCarry: listToLines(pkg.THINGS_TO_CARRY),
    notes: listToLines(pkg.NOTES),
    cancellationPolicy: pkg.CANCELLATION_POLICY ?? "",
    image: pkg.PKG_IMAGE ?? "",
    gallery: pkg.GALLERY ?? [],
    brochure: pkg.BROCHURE ?? "",
  };
}

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loaded, setLoaded] = useState<{ initial: PackageFormValues; missing: MissingMedia } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/packages/${id}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.pkg) throw new Error(d.error || "Could not load this package.");
        setLoaded({
          initial: toFormValues(d.pkg),
          missing: { image: !!d.imageMissing, gallery: d.galleryMissing ?? [] },
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load this package."));
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="Edit Package" />
      {loaded ? (
        <PackageForm pkgId={Number(id)} initial={loaded.initial} missing={loaded.missing} />
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <Loading />
      )}
    </div>
  );
}
