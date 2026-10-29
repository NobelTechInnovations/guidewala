/**
 * Tiny, dependency-free Markdown → HTML for blog posts written in admin.
 * Supports: # headings, **bold**, *italic*, [links](url), ![images](url),
 * - / 1. lists, > quotes, --- rules, blank-line paragraphs, single-line breaks.
 * All text is HTML-escaped first, and only http(s), mailto and site-relative
 * URLs are allowed, so pasted text can't inject markup.
 */

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function safeUrl(url: string): string | null {
  const u = url.trim();
  return /^(https?:\/\/|mailto:|\/(?!\/))/i.test(u) ? u : null;
}

/** Inline formatting on an already-escaped line. */
function inline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
      const u = safeUrl(url);
      return u ? `<img src="${u}" alt="${alt}" loading="lazy" />` : m;
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const u = safeUrl(url);
      if (!u) return m;
      const ext = /^https?:\/\//i.test(u) ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${u}"${ext}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

export function markdownToHtml(md: string): string {
  const lines = escape(md.replace(/\r\n?/g, "\n")).split("\n");
  const out: string[] = [];
  let para: string[] = [];
  type List = { tag: "ul" | "ol"; items: string[] };
  let list = null as List | null;

  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join("<br />")}</p>`);
    para = [];
  };
  const flushList = () => {
    const l = list as List | null;
    if (l) out.push(`<${l.tag}>${l.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${l.tag}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    let m: RegExpMatchArray | null;
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      flushPara();
      flushList();
      const level = Math.min(m[1].length + 1, 5); // "#" → h2 (page title is h1)
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
    } else if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushPara();
      flushList();
      out.push("<hr />");
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/)) || (m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
      flushPara();
      const tag = /^\s*\d/.test(line) ? "ol" : "ul";
      if ((list as List | null)?.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list!.items.push(m[1]);
    } else if ((m = line.match(/^&gt;\s?(.*)$/))) {
      flushPara();
      flushList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out.join("\n");
}

/** Content typed in admin: kept as-is if it's already HTML, otherwise Markdown/plain text. */
export function blogContentToHtml(content: string): string {
  return /^\s*<[a-z!/]/i.test(content) ? content : markdownToHtml(content);
}
