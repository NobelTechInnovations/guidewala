import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";
import { toAbsoluteUrl } from "@/lib/url";

// Public read-only endpoint — single published post, matching /blog/[slug].
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();

  const post = await BlogPost.findOne({ SLUG: slug, IS_PUBLISHED: true })
    .select("TITLE SLUG EXCERPT CONTENT_HTML COVER_IMAGE AUTHOR_NAME TAGS PUBLISHED_ON -_id")
    .lean();

  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  return NextResponse.json({
    title: post.TITLE,
    slug: post.SLUG,
    excerpt: post.EXCERPT,
    contentHtml: post.CONTENT_HTML,
    coverImage: toAbsoluteUrl(post.COVER_IMAGE, req),
    authorName: post.AUTHOR_NAME,
    tags: post.TAGS,
    publishedOn: post.PUBLISHED_ON,
  });
}
