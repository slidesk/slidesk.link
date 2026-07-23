import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/hooks/use-copy";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  message,
  label = "Copy",
  className,
}: {
  text: string;
  message?: string;
  label?: string;
  className?: string;
}) {
  const { copy, copied } = useCopy();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn("h-8 w-8 shrink-0", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        copy(text, message);
      }}
    >
      {copied ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
