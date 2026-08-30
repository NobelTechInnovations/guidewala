import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";

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
};

async function getPost(slug: string) {
  await dbConnect();
  return (await BlogPost.findOne({ SLUG: slug, IS_PUBLISHED: true }).lean()) as unknown as PostLean | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | Guidewala" };
  return { title: `${post.TITLE} | Guidewala Blog`, description: post.EXCERPT };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main>
      {post.COVER_IMAGE ? (
        <div className="relative h-[40vh] min-h-[280px] bg-slate-900">
          <Image src={post.COVER_IMAGE} alt={post.TITLE} fill sizes="100vw" className="object-cover opacity-80" />
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
