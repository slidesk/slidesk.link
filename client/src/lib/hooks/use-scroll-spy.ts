import { useEffect, useState } from "react";

/**
 * Tracks which of the given element ids is currently the "active" one in the
 * viewport (nearest to the vertical center). Powers AddonNav's highlight.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const key = ids.join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the stable derivation of `ids`
  useEffect(() => {
    if (ids.length === 0) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        // pick the id whose element is most in view; fall back to document order
        let best: string | null = null;
        let bestRatio = -1;
        for (const id of ids) {
          const r = visible.get(id);
          if (r !== undefined && r > bestRatio) {
            best = id;
            bestRatio = r;
          }
        }
        if (best) setActiveId(best);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
