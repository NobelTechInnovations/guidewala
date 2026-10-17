import { Fragment } from "react";
import { htmlToText, looksLikeHtml, textToParagraphs } from "@/lib/packages";

/**
 * Admin-entered copy. Legacy records hold HTML (rendered as-is — it only ever
 * comes from the admin panel); the new admin form stores plain text with
 * \r\n breaks, rendered as paragraphs (blank line) and line breaks (single
 * newline). Renders nothing when there's no visible text, so callers can
 * guard headings with the same `htmlToText(...)` check.
 *
 * No hooks, so it works in server and client components alike.
 */
export default function RichText({
  text,
  className = "",
  small = false,
}: {
  text?: string | null;
  className?: string;
  /** Smaller typography scale for HTML (`prose-sm`); plain text just follows `className`. */
  small?: boolean;
}) {
  if (!text || !htmlToText(text)) return null;

  if (looksLikeHtml(text)) {
    return (
      <div
        className={`prose prose-slate max-w-none ${small ? "prose-sm" : ""} ${className}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {textToParagraphs(text).map((lines, i) => (
        <p key={i}>
          {lines.map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
