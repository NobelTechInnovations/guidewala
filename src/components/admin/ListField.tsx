"use client";

import { useId } from "react";
import { Field, inputCls } from "@/components/admin/ui";

/**
 * Textarea for a list of short items, one per line. The form sends it through
 * `linesToList` (trim + drop blanks) and loads it back with `listToLines`.
 */
export default function ListField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint = "One per line",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  const hintId = useId();
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={hintId}
      />
      <span id={hintId} className="block text-xs text-slate-400 mt-1">
        {hint}
      </span>
    </Field>
  );
}
