import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string, message = "Copied!") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, []);

  return { copy, copied };
}
