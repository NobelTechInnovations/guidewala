"use client";

import { useState } from "react";
import { Toggle } from "@/components/admin/ui";

/**
 * Instant "Show on Home" switch for a package: flips optimistically, saves
 * with PATCH, and reverts (with an alert) if the save fails. A missing
 * SHOW_ON_HOME counts as shown, so callers can pass `"Y"` for that case.
 */
export default function HomeToggle({ pkgId, initial }: { pkgId: number; initial: "Y" | "N" }) {
  const [on, setOn] = useState(initial !== "N");
  const [saving, setSaving] = useState(false);

  const change = async (next: boolean) => {
    setOn(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/packages/${pkgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnHome: next ? "Y" : "N" }),
      });
      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not update Show on Home.");
      }
    } catch (err) {
      setOn(!next);
      alert(err instanceof Error ? err.message : "Could not update Show on Home.");
    } finally {
      setSaving(false);
    }
  };

  return <Toggle checked={on} onChange={change} label="Show on Home" disabled={saving} />;
}
