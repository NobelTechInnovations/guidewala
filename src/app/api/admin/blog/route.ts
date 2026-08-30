import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET() {
  await dbConnect();
  const posts = await BlogPost.find({}).sort({ PUBLISHED_ON: -1 }).lean();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, excerpt, contentHtml, coverImage, authorName, tags, isPublished } = body as {
    title?: string;
    excerpt?: string;
    contentHtml?: string;
    coverImage?: string;
    authorName?: string;
    tags?: string;
    isPublished?: boolean;
  };

  if (!title || !contentHtml) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  await dbConnect();

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;
  while (await BlogPost.findOne({ SLUG: slug })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const post = await BlogPost.create({
    TITLE: title,
    SLUG: slug,
    EXCERPT: excerpt || "",
    CONTENT_HTML: contentHtml,
    COVER_IMAGE: coverImage || "",
    AUTHOR_NAME: authorName || "Team Guidewala",
    TAGS: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    IS_PUBLISHED: isPublished ?? true,
    PUBLISHED_ON: new Date(),
  });

  return NextResponse.json({ ok: true, post });
}
