import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

type PdfDoc = Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>;

export default function PdfCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [error, setError] = useState(false);

  // Load the document once.
  useEffect(() => {
    let cancelled = false;
    const proxied = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
    pdfjsLib
      .getDocument({ url: proxied })
      .promise.then((doc) => {
        if (cancelled) return;
        docRef.current = doc;
        setNumPages(doc.numPages);
        setPage(1);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Render the current page whenever page/scale changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: numPages re-triggers render once the doc ref has loaded
  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    let cancelled = false;
    doc.getPage(page).then((p) => {
      if (cancelled) return;
      const viewport = p.getViewport({ scale });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      p.render({ canvasContext: ctx, viewport, canvas });
    });
    return () => {
      cancelled = true;
    };
  }, [page, scale, numPages]);

  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const next = useCallback(
    () => setPage((p) => Math.min(numPages, p + 1)),
    [numPages],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (error)
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive">
        Could not load this PDF.
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto rounded-md bg-muted/40 p-4">
        <canvas ref={canvasRef} className="mx-auto shadow-md" />
      </div>
      <div className="flex items-center justify-center gap-4 pt-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-20 text-center text-sm tabular-nums">
            {page} / {numPages || "…"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            disabled={page >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-12 text-center text-sm tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
