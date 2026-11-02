import type { ParsedRecipeContent } from "lib/store/parse-product-metafields";

export default function ProductPageMetafieldBody({
  content,
  className,
}: {
  content: ParsedRecipeContent;
  className?: string;
}) {
  if (content.html) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  return (
    <div className={className}>
      {content.lines.map((line) => {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex > 0) {
          const label = line.slice(0, separatorIndex + 1);
          const value = line.slice(separatorIndex + 1).trim();
          return (
            <p key={line}>
              <span className="font-medium">{label}</span>
              {value ? <> {value}</> : null}
            </p>
          );
        }

        return <p key={line}>{line}</p>;
      })}
    </div>
  );
}
