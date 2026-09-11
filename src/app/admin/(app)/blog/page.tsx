"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaEye, FaEyeSlash } from "react-icons/fa";

type Post = {
  _id: string;
  TITLE: string;
  SLUG: string;
  IS_PUBLISHED: boolean;
  PUBLISHED_ON: string;
  AUTHOR_NAME: string;
};

export default function AdminBlogListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/blog");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    } else {
      setError("Failed to load posts.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Blog Posts</h1>
          <p className="text-sm text-slate-500">Manage the Guidewala blog</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <FaPlus /> New Post
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium px-3 py-2.5"
          >
            <FaSignOutAlt /> Log out
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {posts === null ? (
        <p className="text-slate-400">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-4">No posts yet.</p>
          <Link href="/admin/blog/new" className="text-gw-brand font-bold hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {posts.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 truncate">{p.TITLE}</h3>
                  {p.IS_PUBLISHED ? (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                      <FaEye /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      <FaEyeSlash /> Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {p.AUTHOR_NAME} · {new Date(p.PUBLISHED_ON).toLocaleDateString()} · /blog/{p.SLUG}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/admin/blog/${p._id}/edit`} className="text-slate-400 hover:text-gw-brand p-2">
                  <FaEdit />
                </Link>
                <button onClick={() => remove(p._id, p.TITLE)} className="text-slate-400 hover:text-red-500 p-2">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
