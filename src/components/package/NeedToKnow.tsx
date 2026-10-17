import type { IconType } from "react-icons";
import { FaInfoCircle, FaRegIdCard, FaSuitcaseRolling } from "react-icons/fa";

interface Group {
  title: string;
  Icon: IconType;
  items: string[];
}

/** Documents / Things to carry / Notes cards; empty groups are skipped (the page hides the section when all are). */
export default function NeedToKnow({
  documents,
  thingsToCarry,
  notes,
}: {
  documents: string[];
  thingsToCarry: string[];
  notes: string[];
}) {
  const groups: Group[] = (
    [
      { title: "Documents required", Icon: FaRegIdCard, items: documents },
      { title: "Things to carry", Icon: FaSuitcaseRolling, items: thingsToCarry },
      { title: "Good to know", Icon: FaInfoCircle, items: notes },
    ] satisfies Group[]
  ).filter((g) => g.items.length > 0);

  return (
    <div className={`grid grid-cols-1 gap-4 ${groups.length > 1 ? "md:grid-cols-2" : ""}`}>
      {groups.map(({ title, Icon, items }, i) => (
        <div
          key={title}
          // An odd last card spans the full row so the grid has no hole.
          className={`rounded-2xl border border-slate-200 bg-white p-6 ${
            groups.length > 1 && groups.length % 2 === 1 && i === groups.length - 1 ? "md:col-span-2" : ""
          }`}
        >
          <h3 className="mb-4 flex items-center gap-2.5 font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gw-brand/10 text-gw-brand">
              <Icon aria-hidden />
            </span>
            {title}
          </h3>
          <ul className="space-y-2.5">
            {items.map((item, k) => (
              <li key={k} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gw-brand" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
