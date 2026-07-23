import { cn } from "@/lib/utils";

export function Logo({
  big = false,
  className,
}: {
  big?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/public/slidesk.svg"
        alt=""
        aria-hidden
        className={big ? "h-9 w-9" : "h-6 w-6"}
      />
      <span
        className={cn(
          "font-bold tracking-tight",
          big ? "text-2xl sm:text-3xl" : "text-lg",
        )}
      >
        SliDesk<span className="text-primary">.link</span>
      </span>
    </span>
  );
}
