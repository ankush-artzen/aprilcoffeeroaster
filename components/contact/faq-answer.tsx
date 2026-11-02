import Link from "next/link";
import type { ReactNode } from "react";

type FaqAnswerProps = {
  answer: string;
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++}>{token.slice(2, -2)}</strong>,
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1] ?? "";
        const href = linkMatch[2] ?? "";
        if (!href) continue;
        const isExternal = href.startsWith("http");
        nodes.push(
          <Link
            key={key++}
            href={href}
            className="underline"
            {...(isExternal
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
          >
            {label}
          </Link>,
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function FaqAnswer({ answer }: FaqAnswerProps) {
  const paragraphs = answer.split(/\n\n+/);

  return (
    <div className="type-text space-y-3 text-[13px] leading-[18px]">
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split("\n");
        return (
          <p key={index} className="whitespace-pre-line">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
