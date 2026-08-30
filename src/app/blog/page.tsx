import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/booking/PageBanner";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";

export const metadata: Metadata = {
  title: "Blog | Guidewala",
  description: "Travel stories, guides, and tips from the Guidewala team — heritage, culture, and hidden corners of India.",
};

type PostLean = {
  _id: string;
  TITLE: string;
  SLUG: string;
  EXCERPT: string;
  COVER_IMAGE: string;
  AUTHOR_NAME: string;
  TAGS: string[];
  PUBLISHED_ON: string;
};

async function getPosts(): Promise<PostLean[]> {
  await dbConnect();
  return (await BlogPost.find({ IS_PUBLISHED: true })
    .sort({ PUBLISHED_ON: -1 })
    .lean()) as unknown as PostLean[];
}

export default async function BlogListPage() {
  const posts = await getPosts();

  return (
    <main>
      <PageBanner title="The Guidewala Journal" crumb="Blog" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">Our first stories are on the way — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
              <Link
                key={p._id}
                href={`/blog/${p.SLUG}`}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                <div className="relative aspect-[16/10] bg-slate-100">
                  {p.COVER_IMAGE ? (
                    <Image
                      src={p.COVER_IMAGE}
                      alt={p.TITLE}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-slate-100">
                      <span className="font-display text-3xl text-gw-brand/30 italic">Guidewala</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  {p.TAGS?.length > 0 && (
                    <span className="text-xs font-bold text-gw-brand uppercase tracking-wide mb-2">
                      {p.TAGS[0]}
                    </span>
                  )}
                  <h2 className="font-display text-lg font-semibold text-slate-900 mb-2 leading-snug text-balance">
                    {p.TITLE}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed flex-grow line-clamp-3">{p.EXCERPT}</p>
                  <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                    {p.AUTHOR_NAME} · {new Date(p.PUBLISHED_ON).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
