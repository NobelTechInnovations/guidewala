"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { PageHeader, Card, Loading } from "@/components/admin/ui";

type Template = { KEY: string; LABEL: string; DESCRIPTION: string; UPDATED_ON: string };

export default function EmailTemplateListPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/email-templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader
        title="Email Templates"
        subtitle="Customize the subject &amp; content of every automatic email the site sends"
      />

      {templates === null ? (
        <Loading />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Template</th>
                <th className="px-5 py-3">When it's sent</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.KEY} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{t.LABEL}</td>
                  <td className="px-5 py-3 text-slate-500">{t.DESCRIPTION}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/email-templates/${t.KEY}`} className="text-slate-400 hover:text-gw-brand p-2 inline-block">
                      <FaEdit />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
