import { PackageTitleMaster } from "@/models";
import type { PackageDoc } from "@/lib/packages";

/** "Grand Tour of Rajasthan" + 17 days → "grand-tour-of-rajasthan-17-days". */
export function baseSlug(title?: string, days?: number): string {
  const s = (title || "package")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  const hasDays = /\bdays?\b/.test(s.replace(/-/g, " "));
  return days && days > 0 && !hasDays ? `${s}-${days}-days` : s || "package";
}

/** Public URL of a package; numeric fallback (redirects to the slug) until one is assigned. */
export function packageHref(p: Pick<PackageDoc, "PKG_ID"> & { SLUG?: string }): string {
  return `/packages/${p.SLUG || p.PKG_ID}`;
}

/**
 * Gives every package without a SLUG a unique one. Slugs are stable once set
 * (renaming a package keeps its URL). Cheap: a handful of docs, and a no-op
 * once everything has a slug.
 */
export async function ensurePackageSlugs(): Promise<void> {
  const all = (await PackageTitleMaster.find({})
    .select("PKG_ID TITLE_NAME DURATION_DAYS SLUG -_id")
    .sort({ PKG_ID: 1 })
    .lean()) as unknown as (PackageDoc & { SLUG?: string })[];
  const taken = new Set(all.map((p) => p.SLUG).filter(Boolean) as string[]);
  for (const p of all) {
    if (p.SLUG) continue;
    const base = baseSlug(p.TITLE_NAME, p.DURATION_DAYS);
    let slug = base;
    for (let n = 2; taken.has(slug) || /^\d+$/.test(slug); n++) slug = `${base}-${n}`;
    taken.add(slug);
    await PackageTitleMaster.updateOne({ PKG_ID: p.PKG_ID, SLUG: { $exists: false } }, { $set: { SLUG: slug } });
  }
}
