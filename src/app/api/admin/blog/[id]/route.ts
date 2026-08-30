import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const post = await BlogPost.findById(id).lean();
  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const post = await BlogPost.findByIdAndUpdate(
    id,
    {
      TITLE: title,
      EXCERPT: excerpt || "",
      CONTENT_HTML: contentHtml,
      COVER_IMAGE: coverImage || "",
      AUTHOR_NAME: authorName || "Team Guidewala",
      TAGS: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      IS_PUBLISHED: isPublished ?? true,
    },
    { new: true }
  );

  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  await BlogPost.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
