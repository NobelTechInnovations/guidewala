"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaEdit, FaTrash, FaListUl } from "react-icons/fa";
import { PageHeader, Badge, EmptyState, Loading, PrimaryLink } from "@/components/admin/ui";
import HomeToggle from "@/components/admin/HomeToggle";
import UploadedImage from "@/components/UploadedImage";
import { mediaPath } from "@/lib/media";
import { isShown, type PackageType } from "@/lib/packages";

/** Labels/paths per section: Tour Packages vs. Guide Services share this list. */
const SECTIONS = {
  tour: { title: "Tour Packages", subtitle: "Multi-day tour packages shown on Tour Packages and Featured Tours", base: "/admin/packages", noun: "Package" },
  guide: { title: "Guide Services", subtitle: "City tour-guide services shown on Book Guide", base: "/admin/guide-services", noun: "Guide Service" },
} as const;

type Pkg = {
  PKG_ID: number;
  TITLE_NAME: string;
  CITY_NAME: string;
  PKG_AMOUNT: number;
  PKG_IMAGE: string;
  IS_ACTIVE: string;
  SHOW_ON_HOME?: string; // "Y" | "N"; missing = shown
  imageMissing?: boolean; // cover file absent from disk
};

export default function PackageList({ type }: { type: PackageType }) {
  const sec = SECTIONS[type];
  const [packages, setPackages] = useState<Pkg[] | null>(null);

  const load = () =>
    fetch(`/api/admin/packages?type=${type}`)
      .then((r) => r.json())
      .then((d) => setPackages(d.packages));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const remove = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader
        title={sec.title}
        subtitle={sec.subtitle}
        action={
          <PrimaryLink href={`${sec.base}/new`}>
            <FaPlus /> New {sec.noun}
          </PrimaryLink>
        }
      />

      {packages === null ? (
        <Loading />
      ) : packages.length === 0 ? (
        <EmptyState message={`No ${sec.title.toLowerCase()} yet.`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((p) => (
            <div key={p.PKG_ID} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-40 bg-slate-100">
                <UploadedImage
                  src={p.imageMissing ? null : mediaPath("pkgTitleImg", p.PKG_IMAGE)}
                  alt={p.TITLE_NAME}
                  sizes="360px"
                  className="object-cover"
                />
                {p.imageMissing && (
                  <div className="absolute top-2 left-2">
                    <Badge tone="red">Missing image — re-upload</Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge tone={isShown(p.IS_ACTIVE) ? "green" : "slate"}>{isShown(p.IS_ACTIVE) ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-1">{p.TITLE_NAME}</h3>
                <p className="text-xs text-slate-500 mb-1">{p.CITY_NAME}</p>
                <p className="text-gw-brand font-extrabold mb-3">₹{p.PKG_AMOUNT?.toLocaleString("en-IN")}/-</p>
                <div className="mb-4">
                  <HomeToggle pkgId={p.PKG_ID} initial={p.SHOW_ON_HOME === "N" ? "N" : "Y"} />
                </div>
                <div className="mt-auto flex items-center gap-2">
                  {type === "tour" && (
                  <Link
                      href={`/admin/packages/${p.PKG_ID}/itinerary`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 font-bold px-3 py-2 rounded-lg text-xs hover:bg-amber-100"
                    >
                      <FaListUl /> Itinerary
                    </Link>
                  )}
                  <Link
                    href={`${sec.base}/${p.PKG_ID}/edit`}
                    style={type === "guide" ? { flex: 1 } : undefined}
                    className="flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 font-bold px-3 py-2 rounded-lg text-xs hover:bg-blue-100"
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    onClick={() => remove(p.PKG_ID, p.TITLE_NAME)}
                    className="flex items-center justify-center gap-1.5 bg-red-50 text-red-700 font-bold px-3 py-2 rounded-lg text-xs hover:bg-red-100"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
