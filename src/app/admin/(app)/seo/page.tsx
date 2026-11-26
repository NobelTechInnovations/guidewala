"use client";

import { useEffect, useState, FormEvent } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import { PageHeader, Card, Field, inputCls, Loading, EmptyState } from "@/components/admin/ui";

type Kind = "links" | "pages" | "faqs";
type FieldDef = { key: string; doc: string; label: string; type?: "text" | "textarea" | "number" | "flag"; placeholder?: string; hint?: string };
type Row = Record<string, string | number> & { _id: string };

/** Each tab: the form fields (body key ↔ stored UPPER_SNAKE field) and the list columns. */
const TABS: Record<Kind, { label: string; intro: string; fields: FieldDef[]; columns: string[] }> = {
  links: {
    label: "Footer Keywords",
    intro: "Keyword links shown in the footer on every page (e.g. “Guide service in Jaipur” → /book-guide?city=CT001). Group = footer column heading.",
    fields: [
      { key: "label", doc: "LABEL", label: "Keyword text", placeholder: "Guide service in Jaipur" },
      { key: "url", doc: "URL", label: "Link", placeholder: "/book-guide?city=CT001", hint: "Site path (starts with /) or full https:// URL" },
      { key: "group", doc: "GROUP", label: "Footer column", placeholder: "Popular Searches" },
      { key: "order", doc: "ORDER", label: "Order", type: "number" },
      { key: "isActive", doc: "IS_ACTIVE", label: "Show", type: "flag" },
    ],
    columns: ["LABEL", "URL", "GROUP", "ORDER", "IS_ACTIVE"],
  },
  pages: {
    label: "Page SEO",
    intro: "Override the Google title, description and keywords of any page. Leave a field blank to keep the site default.",
    fields: [
      { key: "path", doc: "PATH", label: "Page path", placeholder: "/book-guide", hint: "e.g. /, /tour-packages, /packages/<slug>, /blog/<slug>" },
      { key: "title", doc: "TITLE", label: "SEO title (≤ 60 chars)", placeholder: "Book a Tour Guide in Jaipur | Guidewala" },
      { key: "description", doc: "DESCRIPTION", label: "Meta description (140–160 chars)", type: "textarea" },
      { key: "keywords", doc: "KEYWORDS", label: "Keywords (comma-separated)", placeholder: "tour guide jaipur, jaipur guide" },
      { key: "ogImage", doc: "OG_IMAGE", label: "Share image (optional)", placeholder: "/uploads/blogImg/… or https://…" },
      { key: "noindex", doc: "NOINDEX", label: "Hide from Google", type: "flag" },
    ],
    columns: ["PATH", "TITLE", "DESCRIPTION", "NOINDEX"],
  },
  faqs: {
    label: "FAQs",
    intro: "Questions & answers shown on a page with FAQ schema — great for Google and AI answers (GEO). Page “*” = shown on every page that has an FAQ block.",
    fields: [
      { key: "question", doc: "QUESTION", label: "Question", placeholder: "How much does a guide in Jaipur cost?" },
      { key: "answer", doc: "ANSWER", label: "Answer", type: "textarea" },
      { key: "pagePath", doc: "PAGE_PATH", label: "Page", placeholder: "/", hint: "/, /book-guide, /tour-packages, /packages/<slug>, or *" },
      { key: "order", doc: "ORDER", label: "Order", type: "number" },
      { key: "isActive", doc: "IS_ACTIVE", label: "Show", type: "flag" },
    ],
    columns: ["QUESTION", "PAGE_PATH", "ORDER", "IS_ACTIVE"],
  },
};

const blank = (kind: Kind) =>
  Object.fromEntries(TABS[kind].fields.map((f) => [f.key, f.type === "flag" ? (f.key === "noindex" ? "N" : "Y") : f.type === "number" ? "0" : ""]));

export default function SeoAdminPage() {
  const [tab, setTab] = useState<Kind | "ai">("links");
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader title="SEO" subtitle="Footer keywords, page titles & descriptions, FAQs and AI summary" />
      <div className="flex flex-wrap gap-2 mb-6">
        {(["links", "pages", "faqs", "ai"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === k ? "bg-gw-brand text-white" : "bg-white border border-slate-200 text-slate-600"}`}
          >
            {k === "ai" ? "AI / GEO Summary" : TABS[k].label}
          </button>
        ))}
      </div>
      {tab === "ai" ? <AiSummary /> : <SeoTable key={tab} kind={tab} />}
    </div>
  );
}

function SeoTable({ kind }: { kind: Kind }) {
  const cfg = TABS[kind];
  const [items, setItems] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [v, setV] = useState<Record<string, string>>(blank(kind));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch(`/api/admin/seo/${kind}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const open = (row?: Row) => {
    setError("");
    setEditing(row ? row._id : "new");
    setV(row ? Object.fromEntries(cfg.fields.map((f) => [f.key, String(row[f.doc] ?? "")])) : blank(kind));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(editing === "new" ? `/api/admin/seo/${kind}` : `/api/admin/seo/${kind}/${editing}`, {
      method: editing === "new" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(d.error || "Save failed.");
    setEditing(null);
    load();
  };

  const remove = async (row: Row) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/admin/seo/${kind}/${row._id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-sm text-slate-500 max-w-2xl">{cfg.intro}</p>
        {!editing && (
          <button onClick={() => open()} className="shrink-0 flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm">
            <FaPlus /> Add
          </button>
        )}
      </div>

      {editing && (
        <Card className="p-6 mb-6">
          <form onSubmit={save}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {cfg.fields.map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Field label={f.label}>
                    {f.type === "textarea" ? (
                      <textarea rows={3} className={inputCls} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
                    ) : f.type === "flag" ? (
                      <select className={inputCls} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })}>
                        <option value="Y">Yes</option>
                        <option value="N">No</option>
                      </select>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        className={inputCls}
                        value={v[f.key]}
                        placeholder={f.placeholder}
                        onChange={(e) => setV({ ...v, [f.key]: e.target.value })}
                      />
                    )}
                  </Field>
                  {f.hint && <p className="-mt-3 mb-4 text-xs text-slate-400">{f.hint}</p>}
                  {f.key === "description" && <p className="-mt-3 mb-4 text-xs text-slate-400">{v.description.length} characters</p>}
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100">
                <FaTimes /> Cancel
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
                <FaSave /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState message="Nothing added yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100">
                {cfg.columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-bold">
                    {cfg.fields.find((f) => f.doc === c)?.label.replace(/ \(.*\)$/, "") || c}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className="border-b border-slate-50 align-top">
                  {cfg.columns.map((c) => (
                    <td key={c} className="px-4 py-3 text-slate-700 max-w-xs truncate" title={String(row[c] ?? "")}>
                      {String(row[c] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button onClick={() => open(row)} className="text-blue-600 mr-3" aria-label="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => remove(row)} className="text-red-600" aria-label="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function AiSummary() {
  const [text, setText] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/admin/seo/settings")
      .then((r) => r.json())
      .then((d) => setText(d.settings?.siteSummary || ""));
  }, []);

  const save = async () => {
    setStatus("Saving…");
    const res = await fetch("/api/admin/seo/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteSummary: text }),
    });
    setStatus(res.ok ? "Saved ✓" : "Save failed");
  };

  if (text === null) return <Loading />;
  return (
    <Card className="p-6">
      <p className="text-sm text-slate-500 mb-4">
        A plain-language description of Guidewala for AI assistants (ChatGPT, Gemini, Perplexity). It is published at{" "}
        <a href="/llms.txt" target="_blank" className="text-gw-brand font-bold">/llms.txt</a> together with your packages, guide services,
        blog posts and FAQs, which update automatically. Write who you are, where you operate, what you offer, prices and how to book.
      </p>
      <textarea rows={10} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex items-center justify-end gap-3 mt-4">
        <span className="text-sm text-slate-500">{status}</span>
        <button onClick={save} className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
          <FaSave /> Save
        </button>
      </div>
    </Card>
  );
}
