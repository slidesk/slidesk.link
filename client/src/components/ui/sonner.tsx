import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/components/theme-provider";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
