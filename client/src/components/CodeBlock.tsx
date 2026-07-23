import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import { useMemo } from "react";

import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("json", json);

export function CodeBlock({
  code,
  language,
  filename,
  className,
}: {
  code: string;
  language: "yaml" | "json";
  filename?: string;
  className?: string;
}) {
  const html = useMemo(
    () => hljs.highlight(code, { language }).value,
    [code, language],
  );

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {filename ?? language}
        </span>
        <CopyButton
          text={code}
          message="Copied!"
          label="Copy code"
          className="h-7 w-7"
        />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}
