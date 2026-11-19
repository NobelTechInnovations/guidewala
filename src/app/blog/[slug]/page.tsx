import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";
import { absUrl, jsonLd, pageMeta, truncate } from "@/lib/seo";
import { SITE_LOGO, SITE_NAME } from "@/lib/site";

type PostLean = {
  TITLE: string;
  SLUG: string;
  EXCERPT: string;
  CONTENT_HTML: string;
  COVER_IMAGE: string;
  AUTHOR_NAME: string;
  TAGS: string[];
  PUBLISHED_ON: string;
  IS_PUBLISHED: boolean;
  updatedAt?: string;
};

async function getPost(slug: string) {
  await dbConnect();
  const post = (await BlogPost.findOne({ SLUG: slug, IS_PUBLISHED: true }).lean()) as unknown as PostLean | null;
  if (post) return post;
  // A renamed slug ("…-2" → "…") keeps working: redirect the old suffixed URL permanently.
  const base = slug.replace(/-\d+$/, "");
  if (base !== slug && (await BlogPost.exists({ SLUG: base, IS_PUBLISHED: true }))) permanentRedirect(`/blog/${base}`);
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | Guidewala", robots: { index: false } };
  return pageMeta({
    title: `${truncate(post.TITLE, 46)} | Guidewala Blog`,
    description: truncate(post.EXCERPT || post.TITLE, 155),
    path: `/blog/${post.SLUG}`,
    image: post.COVER_IMAGE || null,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = absUrl(`/blog/${post.SLUG}`);
  const postLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.TITLE,
    description: post.EXCERPT,
    ...(post.COVER_IMAGE ? { image: absUrl(post.COVER_IMAGE) } : {}),
    datePublished: new Date(post.PUBLISHED_ON).toISOString(),
    dateModified: new Date(post.updatedAt || post.PUBLISHED_ON).toISOString(),
    author: { "@type": "Person", name: post.AUTHOR_NAME || "Team Guidewala" },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absUrl(SITE_LOGO) } },
    mainEntityOfPage: url,
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.TITLE, item: url },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(postLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbsLd)} />
      {post.COVER_IMAGE ? (
        <div className="relative h-[40vh] min-h-[280px] bg-slate-900">
          <Image src={post.COVER_IMAGE} alt={post.TITLE} fill unoptimized sizes="100vw" className="object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        </div>
      ) : (
        <div className="h-40 bg-gw-dark" />
      )}

      <article className="max-w-3xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gw-brand mb-6 hover:underline">
            <FaArrowLeft /> Back to Blog
          </Link>

          {post.TAGS?.length > 0 && (
            <div className="flex gap-2 mb-4">
              {post.TAGS.map((t) => (
                <span key={t} className="text-xs font-bold text-gw-brand bg-green-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  {t}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-semibold text-slate-900 mb-4 leading-tight text-balance">
            {post.TITLE}
          </h1>

          <p className="text-sm text-slate-400 mb-8 pb-8 border-b border-slate-100">
            By {post.AUTHOR_NAME} ·{" "}
            {new Date(post.PUBLISHED_ON).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div
            className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-gw-brand"
            dangerouslySetInnerHTML={{ __html: post.CONTENT_HTML }}
          />
        </div>
      </article>
    </main>
  );
}
