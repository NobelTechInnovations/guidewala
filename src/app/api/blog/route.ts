import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";
import { toAbsoluteUrl } from "@/lib/url";

// Public read-only endpoint — published blog posts, matching /blog.
export async function GET(req: NextRequest) {
  await dbConnect();
  const posts = await BlogPost.find({ IS_PUBLISHED: true })
    .sort({ PUBLISHED_ON: -1 })
    .select("TITLE SLUG EXCERPT COVER_IMAGE AUTHOR_NAME TAGS PUBLISHED_ON -_id")
    .lean();

  return NextResponse.json({
    posts: posts.map((p) => ({
      title: p.TITLE,
      slug: p.SLUG,
      excerpt: p.EXCERPT,
      coverImage: toAbsoluteUrl(p.COVER_IMAGE, req),
      authorName: p.AUTHOR_NAME,
      tags: p.TAGS,
      publishedOn: p.PUBLISHED_ON,
    })),
  });
}
