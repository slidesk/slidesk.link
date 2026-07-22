import { lazy, Suspense, useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const PdfCanvas = lazy(() => import("@/components/pdf/PdfCanvas"));

/**
 * Wrap page content that may contain links to `.pdf` files. Clicking such a
 * link opens an in-app PDF viewer (via the SSRF-guarded /api/proxy-pdf) instead
 * of navigating away. pdf.js is code-split and only loaded on first use.
 */
export function PdfViewerDialog({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href$=".pdf"]',
      );
      if (!link) return;
      e.preventDefault();
      setUrl(link.href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      {children}
      <Dialog open={!!url} onOpenChange={(o) => !o && setUrl(null)}>
        <DialogContent className="h-[85vh] max-w-4xl">
          <DialogTitle className="sr-only">PDF preview</DialogTitle>
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            {url && <PdfCanvas url={url} />}
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
}
