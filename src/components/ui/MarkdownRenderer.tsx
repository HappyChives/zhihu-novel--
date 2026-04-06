import type { ReactNode } from "react";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function renderInline(text: string): string {
  // 先转义 HTML，再用 Markdown 替换
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-dark-card px-1 rounded text-primary-300 text-xs font-mono'>$1</code>");
}

function renderLine(line: string): ReactNode {
  if (line.match(/^---+$/)) {
    return <hr key={Math.random()} className="border-dark-border my-4" />;
  }
  if (line.startsWith("## ")) {
    return (
      <h2 key={Math.random()} className="text-lg font-bold text-white mt-6 mb-2">
        {line.replace("## ", "")}
      </h2>
    );
  }
  if (line.startsWith("### ")) {
    return (
      <h3 key={Math.random()} className="text-base font-semibold text-gray-200 mt-4 mb-1">
        {line.replace("### ", "")}
      </h3>
    );
  }
  if (line.startsWith("#### ")) {
    return (
      <h4 key={Math.random()} className="text-sm font-semibold text-gray-300 mt-3 mb-1">
        {line.replace("#### ", "")}
      </h4>
    );
  }
  if (!line.trim()) {
    return null;
  }
  return (
    <p
      key={Math.random()}
      className="text-gray-300 text-sm my-1 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderInline(line) }}
    />
  );
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 列表项
    if (line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      const keyBase = Math.random();
      while (
        i < lines.length &&
        (lines[i].match(/^[-*]\s/) || lines[i].match(/^\d+\.\s/))
      ) {
        listItems.push(lines[i]);
        i++;
      }
      elements.push(
        <ul
          key={keyBase}
          className="list-disc pl-6 space-y-1 text-gray-300 text-sm my-2"
        >
          {listItems.map((item, j) => (
            <li
              key={j}
              dangerouslySetInnerHTML={{
                __html: renderInline(
                  item.replace(/^[-*]\s/, "").replace(/^\d+\.\s/, "")
                ),
              }}
            />
          ))}
        </ul>
      );
      continue;
    }

    elements.push(renderLine(line));
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}
