"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaTimesCircle, FaUpload, FaImage } from "react-icons/fa";
import { blogContentToHtml } from "@/lib/markdown";

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
  const [uploading, setUploading] = useState<"" | "cover" | "inline">("");
  const [preview, setPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  /** Uploads one image to /api/admin/blog/upload and returns its site path. */
  const upload = async (file: File, kind: "cover" | "inline") => {
    setError("");
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.set("image", file);
      const res = await fetch("/api/admin/blog/upload", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.url) throw new Error(d.error || "Upload failed.");
      return d.url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      return null;
    } finally {
      setUploading("");
    }
  };

  const insertImage = async (file: File) => {
    const url = await upload(file, "inline");
    if (!url) return;
    const el = contentRef.current;
    const pos = el ? el.selectionStart : form.contentHtml.length;
    const snippet = `\n\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n\n`;
    set("contentHtml", form.contentHtml.slice(0, pos) + snippet + form.contentHtml.slice(pos));
  };

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
        <label className="frm-label">Cover Image</label>
        <div className="flex flex-wrap items-center gap-4">
          {form.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverImage} alt="" className="h-20 w-32 object-cover rounded-lg border border-slate-200" />
          )}
          <label className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-sm cursor-pointer">
            <FaUpload /> {uploading === "cover" ? "Uploading…" : form.coverImage ? "Change image" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              disabled={!!uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) {
                  const url = await upload(file, "cover");
                  if (url) set("coverImage", url);
                }
              }}
            />
          </label>
          {form.coverImage && (
            <button type="button" onClick={() => set("coverImage", "")} className="text-sm text-red-600 font-medium">
              Remove
            </button>
          )}
        </div>
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
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <label className="frm-label !mb-0">Content *</label>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
              <FaImage /> {uploading === "inline" ? "Uploading…" : "Insert image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                disabled={!!uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) insertImage(file);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="text-xs font-bold text-gw-brand bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
        </div>
        {preview ? (
          <div
            className="prose prose-slate max-w-none border border-slate-200 rounded-lg p-4 min-h-72"
            dangerouslySetInnerHTML={{ __html: blogContentToHtml(form.contentHtml) }}
          />
        ) : (
          <textarea
            ref={contentRef}
            className="modern-input h-72 resize-y"
            value={form.contentHtml}
            onChange={(e) => set("contentHtml", e.target.value)}
            placeholder={"Write normally — just type your text.\n\nOptional formatting:\n# Heading\n**bold**  *italic*\n- list item\n[link text](https://...)"}
          />
        )}
        <p className="text-xs text-slate-400 mt-1.5">
          Plain text works. Blank line = new paragraph. Optional: # heading, **bold**, *italic*, - list, [text](link).
        </p>
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
