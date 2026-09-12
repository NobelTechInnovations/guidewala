"use client";

import { useEffect, useState, use, FormEvent } from "react";
import Link from "next/link";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { PageHeader, Card, Field, Loading, inputCls } from "@/components/admin/ui";

type Template = {
  KEY: string;
  LABEL: string;
  DESCRIPTION: string;
  SUBJECT: string;
  BODY_HTML: string;
  VARIABLES: string[];
};

export default function EditEmailTemplatePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/email-templates/${key}`)
      .then((r) => r.json())
      .then((d) => {
        setTemplate(d.template);
        setSubject(d.template.SUBJECT);
        setBody(d.template.BODY_HTML);
      });
  }, [key]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml: body }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/admin/email-templates" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <FaArrowLeft /> Back to Email Templates
      </Link>
      <PageHeader title={template.LABEL} subtitle={template.DESCRIPTION} />

      <form onSubmit={submit}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {saved && <p className="text-green-600 text-sm mb-4">Saved — this template is now live.</p>}

        <Card className="p-6 mb-5">
          {template.VARIABLES.length > 0 && (
            <div className="mb-5 bg-gw-bg rounded-lg p-3 text-xs text-slate-600">
              <span className="font-bold text-slate-700">Available placeholders: </span>
              {template.VARIABLES.map((v) => (
                <code key={v} className="bg-white border border-slate-200 rounded px-1.5 py-0.5 mr-1.5 font-mono">
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
          )}

          <Field label="Subject" required>
            <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Body (HTML)" required>
            <textarea
              rows={14}
              className={`${inputCls} font-mono text-xs`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60"
          >
            <FaSave /> {saving ? "Saving…" : "Save Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
