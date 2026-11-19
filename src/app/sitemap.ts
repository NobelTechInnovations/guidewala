import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost, PackageTitleMaster } from "@/models";
import { ensurePackageSlugs } from "@/lib/packageSlugs";
import { SITE_URL } from "@/lib/site";

// Built from the database on request so new packages/posts appear without a rebuild.
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "/",
  "/about-us",
  "/tour-packages",
  "/book-guide",
  "/taxi-service",
  "/hotel-booking",
  "/blog",
  "/contact-us",
  "/guide-registration",
  "/coupons",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();
  await ensurePackageSlugs();
  const [packages, posts] = await Promise.all([
    PackageTitleMaster.find({ IS_ACTIVE: "Y" }).select("SLUG CREATED_ON -_id").lean() as unknown as Promise<
      { SLUG?: string; CREATED_ON?: Date }[]
    >,
    BlogPost.find({ IS_PUBLISHED: true }).select("SLUG PUBLISHED_ON updatedAt -_id").lean() as unknown as Promise<
      { SLUG: string; PUBLISHED_ON?: Date; updatedAt?: Date }[]
    >,
  ]);
  const now = new Date();

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...packages
      .filter((p) => p.SLUG)
      .map((p) => ({
        url: `${SITE_URL}/packages/${p.SLUG}`,
        lastModified: p.CREATED_ON ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.SLUG}`,
      lastModified: p.updatedAt ?? p.PUBLISHED_ON ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
