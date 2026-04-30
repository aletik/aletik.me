/**
 * <download-button> custom tag → styled <a class="btn"> anchor.
 *
 * Author syntax in markdown:
 *   <download-button href="..." variant="primary|secondary|outline" icon="download|github|external|apple|none">
 *     Label text
 *   </download-button>
 *
 * Adjacent buttons are grouped into a .download-buttons flex row.
 *
 * Usage:
 *   const stash = extractDownloadButtons(rawMarkdown);
 *   bodyEl.innerHTML = marked.parse(stash.markdown);
 *   renderDownloadButtons(bodyEl, stash);
 */

const ICONS: Record<string, string> = {
  download:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  github:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  external:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>',
  apple:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
  none: "",
};

const VARIANTS = new Set(["primary", "secondary", "outline"]);

interface StashEntry {
  rawAttrs: string;
  label: string;
}

export interface DownloadButtonStash {
  markdown: string;
  entries: StashEntry[];
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Pull every <download-button>...</download-button> out of the raw markdown
 * and replace it with a <span data-dlbtn="N"></span> placeholder. The
 * placeholder survives marked.parse() intact even when wrapped in a <p>,
 * so it can be swapped for a real .btn anchor afterwards.
 */
export function extractDownloadButtons(md: string): DownloadButtonStash {
  const entries: StashEntry[] = [];
  let out = String(md).replace(
    /<download-button\b([\s\S]*?)>([\s\S]*?)<\/download-button>/gi,
    (_match, rawAttrs: string, inner: string) => {
      const idx = entries.length;
      entries.push({
        rawAttrs: rawAttrs || "",
        label: (inner || "").replace(/\s+/g, " ").trim(),
      });
      return `<span data-dlbtn="${idx}"></span>`;
    },
  );

  // CommonMark closes block-level HTML at the first blank line, which
  // would split a centering wrapper apart. Collapse blank lines only
  // inside wrappers that hold our placeholders.
  out = out.replace(
    /<(div|section|article|aside|main|header|footer|nav)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (match) => {
      if (!/<span data-dlbtn=/.test(match)) return match;
      return match.replace(/(\r?\n)[ \t]*\r?\n+/g, "$1");
    },
  );

  return { markdown: out, entries };
}

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  String(raw).replace(/([\w-]+)\s*=\s*"([^"]*)"/g, (_, k: string, v: string) => {
    out[k.toLowerCase()] = v;
    return "";
  });
  String(raw).replace(/([\w-]+)\s*=\s*'([^']*)'/g, (_, k: string, v: string) => {
    out[k.toLowerCase()] = v;
    return "";
  });
  return out;
}

export function renderDownloadButtons(
  root: HTMLElement,
  stash: DownloadButtonStash,
): void {
  const nodes = root.querySelectorAll<HTMLSpanElement>("span[data-dlbtn]");
  if (!nodes.length) return;

  const created: HTMLAnchorElement[] = [];
  nodes.forEach((el) => {
    const idx = parseInt(el.getAttribute("data-dlbtn") || "", 10);
    const data = stash.entries[idx];
    if (!data) return;

    const attrs = parseAttrs(data.rawAttrs);
    const href = attrs.href || "#";
    let variant = (attrs.variant || "primary").toLowerCase();
    if (!VARIANTS.has(variant)) variant = "primary";
    const iconName = (attrs.icon || "download").toLowerCase();
    const iconHTML = iconName in ICONS ? ICONS[iconName] : ICONS.download;
    const label = data.label;
    const explicitTarget = attrs.target;

    const a = document.createElement("a");
    a.href = href;
    a.className = "btn btn-" + variant;
    a.dataset.fromDownloadBtn = "1";

    if (explicitTarget) {
      a.setAttribute("target", explicitTarget);
      a.setAttribute("rel", "noopener noreferrer");
    } else if (/^https?:\/\//i.test(href)) {
      let sameHost = false;
      try {
        sameHost =
          new URL(href, window.location.href).host === window.location.host;
      } catch {
        // ignore
      }
      if (!sameHost) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    }

    a.innerHTML = iconHTML + (iconHTML ? " " : "") + escapeHTML(label);
    el.parentNode?.replaceChild(a, el);
    created.push(a);
  });

  // If a button is the only meaningful content of its <p>, lift it out
  // so adjacent buttons in separate <p>s become siblings and can be grouped.
  created.forEach((a) => {
    const p = a.parentNode as HTMLElement | null;
    if (!p || p.tagName !== "P") return;
    let hasOther = false;
    p.childNodes.forEach((n) => {
      if (n === a) return;
      if (n.nodeType === 3 && !(n.textContent || "").trim()) return;
      if (n.nodeType === 1 && (n as Element).tagName.toLowerCase() === "br") return;
      if (
        n.nodeType === 1 &&
        (n as HTMLElement).dataset &&
        (n as HTMLElement).dataset.fromDownloadBtn === "1"
      )
        return;
      hasOther = true;
    });
    if (!hasOther && p.parentNode) {
      const siblings = Array.from(p.childNodes);
      siblings.forEach((n) => {
        if (
          n.nodeType === 1 &&
          (n as HTMLElement).dataset &&
          (n as HTMLElement).dataset.fromDownloadBtn === "1"
        ) {
          p.parentNode!.insertBefore(n, p);
        }
      });
      p.parentNode.removeChild(p);
    }
  });

  // Wrap each contiguous run of generated buttons in a .download-buttons flex row.
  let i = 0;
  while (i < created.length) {
    const first = created[i];
    if (!first.parentNode) {
      i++;
      continue;
    }
    if (
      first.parentNode instanceof HTMLElement &&
      first.parentNode.classList.contains("download-buttons")
    ) {
      i++;
      continue;
    }
    const group: HTMLAnchorElement[] = [first];
    let sib = first.nextSibling;
    while (sib) {
      if (sib.nodeType === 3 && !(sib.textContent || "").trim()) {
        sib = sib.nextSibling;
        continue;
      }
      if (
        sib.nodeType === 1 &&
        (sib as HTMLElement).dataset &&
        (sib as HTMLElement).dataset.fromDownloadBtn === "1"
      ) {
        group.push(sib as HTMLAnchorElement);
        sib = sib.nextSibling;
        continue;
      }
      break;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "download-buttons";
    first.parentNode.insertBefore(wrapper, first);
    group.forEach((a) => wrapper.appendChild(a));
    i += group.length;
  }
}
