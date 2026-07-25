import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Travel speed of the hovered text, in pixels per second. */
const SPEED = 40;

/**
 * Single-line label that ellipsises when it overflows and slides its full text
 * into view on hover/focus, then back out. The overflow is measured here and
 * handed to the `.marquee` CSS (see globals.css), which owns the interaction so
 * labels that fit stay completely inert.
 */
export function MarqueeText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const inner = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  const measure = useCallback(() => {
    const el = inner.current;
    if (el) setShift(Math.max(0, el.scrollWidth - el.clientWidth));
  }, []);

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    measure();
    // Remeasure on rail resize and when a collapsed accordion section opens.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <span
      className={cn("marquee block", className)}
      title={children}
      style={
        {
          "--marquee-shift": `${shift}px`,
          "--marquee-duration": `${Math.max(0.4, shift / SPEED)}s`,
        } as React.CSSProperties
      }
    >
      <span ref={inner}>{children}</span>
    </span>
  );
}
