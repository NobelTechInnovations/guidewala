import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-8">New Blog Post</h1>
      <BlogPostForm />
    </div>
  );
}
