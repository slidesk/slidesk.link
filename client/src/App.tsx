import type { ReactNode } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomePage } from "@/routes/HomePage";
import type { AddonKind } from "@/types/api";

function RootLayout() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-dvh flex-col">
        <AppHeader />
        <div className="flex-1">
          <Outlet />
        </div>
        <AppFooter />
      </div>
    </TooltipProvider>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <main className="container flex flex-1 items-center justify-center py-24">
      <p className="text-muted-foreground">{name} — coming soon</p>
    </main>
  );
}

// pages load on first visit so the home page does not ship pdf.js, highlight.js…
const page =
  <M,>(load: () => Promise<M>, pick: (m: M) => ReactNode) =>
  async () => ({ element: pick(await load()) });

const addons = (kind: AddonKind) =>
  page(
    () => import("@/routes/AddonListPage"),
    (m) => <m.AddonListPage kind={kind} />,
  );

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        path: "/mentions",
        lazy: page(
          () => import("@/routes/MentionsPage"),
          (m) => <m.MentionsPage />,
        ),
      },
      { path: "/plugins", lazy: addons("plugin") },
      { path: "/components", lazy: addons("component") },
      { path: "/themes", lazy: addons("theme") },
      { path: "/templates", lazy: addons("template") },
      {
        path: "/search",
        lazy: page(
          () => import("@/routes/SearchPage"),
          (m) => <m.SearchPage />,
        ),
      },
      {
        path: "/users",
        lazy: page(
          () => import("@/routes/UsersPage"),
          (m) => <m.UsersPage />,
        ),
      },
      {
        path: "/profile",
        lazy: page(
          () => import("@/routes/ProfilePage"),
          (m) => <m.ProfilePage />,
        ),
      },
      {
        path: "/u/:slug",
        lazy: page(
          () => import("@/routes/UserPage"),
          (m) => <m.UserPage />,
        ),
      },
      { path: "*", element: <Placeholder name="Not found" /> },
    ],
  },
]);
