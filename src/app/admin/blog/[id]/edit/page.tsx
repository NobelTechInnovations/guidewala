import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { dbConnect } from "@/lib/mongodb";
import { BlogPost } from "@/models";

type PostLean = {
  TITLE: string;
  EXCERPT: string;
  CONTENT_HTML: string;
  COVER_IMAGE: string;
  AUTHOR_NAME: string;
  TAGS: string[];
  IS_PUBLISHED: boolean;
};

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const post = (await BlogPost.findById(id).lean()) as unknown as PostLean | null;
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-8">Edit Blog Post</h1>
      <BlogPostForm
        postId={id}
        initial={{
          title: post.TITLE,
          excerpt: post.EXCERPT,
          contentHtml: post.CONTENT_HTML,
          coverImage: post.COVER_IMAGE,
          authorName: post.AUTHOR_NAME,
          tags: post.TAGS?.join(", ") || "",
          isPublished: post.IS_PUBLISHED,
        }}
      />
    </div>
  );
}
