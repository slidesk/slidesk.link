import { List } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type AddonNavGroup, allAddonIds } from "@/lib/addon-groups";
import { ADDON_META } from "@/lib/addon-meta";
import { useScrollSpy } from "@/lib/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/**
 * In-page navigation for addon listing (and user) pages: a sticky rail on
 * desktop with scroll-spy highlighting, and a Cmd/Ctrl+K command palette on
 * mobile. Derives entirely from the same data as the rendered cards.
 */
export function AddonNav({ groups }: { groups: AddonNavGroup[] }) {
  const ids = allAddonIds(groups);
  const activeId = useScrollSpy(ids);
  const [open, setOpen] = useState(false);

  const navigate = useCallback((id: string) => {
    scrollToId(id);
    setOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (ids.length === 0) return null;

  return (
    <>
      {/* Desktop sticky rail */}
      <nav
        aria-label="On this page"
        className="sticky top-24 hidden max-h-[calc(100vh-8rem)] lg:block"
      >
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <ScrollArea className="max-h-[calc(100vh-11rem)] pr-2">
          <Accordion
            type="multiple"
            defaultValue={groups.map((g) => g.kind)}
            className="w-full"
          >
            {groups.map((group) => {
              const meta = ADDON_META[group.kind];
              const Icon = meta.icon;
              return (
                <AccordionItem
                  key={group.kind}
                  value={group.kind}
                  className="border-none"
                >
                  <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {meta.labelPlural}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <ul className="flex flex-col border-l border-border">
                      {group.items.map((item) => {
                        const active = item.id === activeId;
                        return (
                          <li key={item.id}>
                            <a
                              href={`#${item.id}`}
                              aria-current={active ? "location" : undefined}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(item.id);
                              }}
                              className={cn(
                                "-ml-px block truncate border-l-2 py-1 pl-3 text-sm transition-colors",
                                active
                                  ? "border-primary font-medium text-foreground"
                                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                              )}
                            >
                              {item.slug}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </nav>

      {/* Mobile floating jump button + command palette */}
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 z-30 shadow-lg lg:hidden"
      >
        <List className="h-4 w-4" /> Jump to
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to an addon…" />
        <CommandList>
          <CommandEmpty>No addon found.</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup
              key={group.kind}
              heading={ADDON_META[group.kind].labelPlural}
            >
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.slug} ${item.user}`}
                  onSelect={() => navigate(item.id)}
                >
                  {item.slug}
                  <span className="text-xs text-muted-foreground">
                    @{item.user}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
