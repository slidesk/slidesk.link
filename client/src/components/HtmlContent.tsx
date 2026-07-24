import DOMPurify from "dompurify";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

/**
 * The single place server-rendered markdown HTML (bios, descriptions,
 * abstracts) is injected. Sanitized with DOMPurify as defense-in-depth since
 * the source text is user-authored. Links open safely; theme preview images
 * (base64 data URIs) are allowed.
 */
export function HtmlContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ADD_ATTR: ["target", "rel"],
        FORBID_TAGS: ["style", "script"],
      }),
    [html],
  );

  return (
    // HTML is DOMPurify-sanitized above; this is the single trusted sink.
    <div
      className={cn(
        "prose-slidesk max-w-none text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_img]:rounded-md [&_h4]:mt-3 [&_h4]:font-semibold [&_h4]:text-foreground [&_h5]:font-semibold [&_h5]:text-foreground [&_p]:my-2",
        // Fenced blocks come back from the server pre-highlighted (.hljs
        // tokens); the block owns the frame so the inline-code chrome above
        // has to be undone on the <code> inside it.
        "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-card [&_pre]:p-4 [&_pre]:text-xs [&_pre]:leading-relaxed [&_pre_code]:rounded-none [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
