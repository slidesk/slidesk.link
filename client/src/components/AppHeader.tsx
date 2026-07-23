import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/Logo";
import { ModeToggle } from "@/components/ModeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ADDON_KINDS, ADDON_META } from "@/lib/addon-meta";
import { useMe } from "@/lib/queries";
import { cn } from "@/lib/utils";

const DOCS_URL = "https://slidesk.github.io/slidesk/";

const navLinks = [
  ...ADDON_KINDS.map((k) => ({
    to: ADDON_META[k].path,
    label: ADDON_META[k].labelPlural,
  })),
  { to: "/search", label: "Search" },
];

function DesktopLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          isActive && "text-foreground",
        )
      }
    >
      {label}
    </NavLink>
  );
}

export function AppHeader({ big = false }: { big?: boolean }) {
  const { data: me } = useMe();

  const authActions = me ? (
    <>
      <NavLink
        to="/profile"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Profile
      </NavLink>
      <a
        href="/exit"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Logout
      </a>
    </>
  ) : (
    <a
      href="/login/"
      className={buttonVariants({ variant: "default", size: "sm" })}
    >
      Login
    </a>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <NavLink to="/" aria-label="Home">
          <Logo big={big} />
        </NavLink>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((l) => (
            <DesktopLink key={l.to} {...l} />
          ))}
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Documentation
          </a>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">{authActions}</div>
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-2">
              <SheetTitle>
                <Logo />
              </SheetTitle>
              <div className="mt-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.to}>
                    <NavLink
                      to={l.to}
                      className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      {l.label}
                    </NavLink>
                  </SheetClose>
                ))}
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Documentation
                </a>
                <div className="mt-4 flex flex-col gap-2">{authActions}</div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
