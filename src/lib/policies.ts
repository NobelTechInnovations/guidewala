import { htmlToText } from "./packages";

/**
 * Site-wide cancellation policy. A package may override it with its own
 * `CANCELLATION_POLICY`; blank or whitespace-only means "use the default".
 * Client-safe (no server imports) so the admin form can show it as a placeholder.
 */
export const DEFAULT_CANCELLATION_POLICY =
  "If a booking is cancelled after confirmation, 30% of the booking amount is non-refundable and will be deducted as cancellation charges. The remaining 70% will be refunded.";

export function cancellationPolicyFor(pkg: { CANCELLATION_POLICY?: string }): string {
  const custom = pkg.CANCELLATION_POLICY?.trim();
  return custom || DEFAULT_CANCELLATION_POLICY;
}

/**
 * One-line teaser for the package price card; the full text lives in the
 * page's Cancellation section. The default policy gets a hand-written short
 * form, a custom one is cut to its first sentence.
 */
export function policySummary(policy: string): string {
  if (policy.trim() === DEFAULT_CANCELLATION_POLICY) return "30% non-refundable if cancelled after confirmation.";
  const text = htmlToText(policy).replace(/\s+/g, " ").trim();
  return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
}
