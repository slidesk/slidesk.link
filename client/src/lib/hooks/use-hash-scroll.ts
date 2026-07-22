import { useEffect } from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Smooth-scrolls to the element matching `location.hash` on mount and whenever
 * the hash changes. `ready` gates the initial scroll until content is rendered.
 */
export function useHashScroll(ready = true) {
  useEffect(() => {
    if (!ready) return;
    const scroll = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el)
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
    };
    // let the browser paint the freshly rendered list first
    const t = setTimeout(scroll, 50);
    window.addEventListener("hashchange", scroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", scroll);
    };
  }, [ready]);
}
