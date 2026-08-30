"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaTimesCircle } from "react-icons/fa";

export type BlogPostFormValues = {
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string;
  authorName: string;
  tags: string;
  isPublished: boolean;
};

export default function BlogPostForm({
  initial,
  postId,
}: {
  initial?: Partial<BlogPostFormValues>;
  postId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostFormValues>({
    title: initial?.title || "",
    excerpt: initial?.excerpt || "",
    contentHtml: initial?.contentHtml || "",
    coverImage: initial?.coverImage || "",
    authorName: initial?.authorName || "Team Guidewala",
    tags: initial?.tags || "",
    isPublished: initial?.isPublished ?? true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof BlogPostFormValues>(key: K, value: BlogPostFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.contentHtml.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(postId ? `/api/admin/blog/${postId}` : "/api/admin/blog", {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Something went wrong.");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <FaTimesCircle /> {error}
        </div>
      )}

      <div>
        <label className="frm-label">Title *</label>
        <input className="modern-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Post title" />
      </div>

      <div>
        <label className="frm-label">Excerpt (shown on the blog listing)</label>
        <textarea
          className="modern-input h-20 resize-none"
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="One or two sentence summary"
        />
      </div>

      <div>
        <label className="frm-label">Cover Image URL</label>
        <input
          className="modern-input"
          value={form.coverImage}
          onChange={(e) => set("coverImage", e.target.value)}
          placeholder="/assets/img/... or https://..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="frm-label">Author</label>
          <input className="modern-input" value={form.authorName} onChange={(e) => set("authorName", e.target.value)} />
        </div>
        <div>
          <label className="frm-label">Tags (comma-separated)</label>
          <input
            className="modern-input"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="Rajasthan, Heritage, Travel Tips"
          />
        </div>
      </div>

      <div>
        <label className="frm-label">Content (HTML) *</label>
        <textarea
          className="modern-input h-72 font-mono text-xs resize-y"
          value={form.contentHtml}
          onChange={(e) => set("contentHtml", e.target.value)}
          placeholder="<p>Write your post here — basic HTML tags like &lt;p&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;img&gt; work.</p>"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          className="accent-gw-brand w-4 h-4"
          checked={form.isPublished}
          onChange={(e) => set("isPublished", e.target.checked)}
        />
        Published (visible on the public blog)
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gw-brand hover:bg-green-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : postId ? "Save Changes" : "Publish Post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="text-slate-500 hover:text-slate-700 font-medium px-4"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
