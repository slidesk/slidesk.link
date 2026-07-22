import { createBrowserRouter, Outlet } from "react-router-dom";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AddonListPage } from "@/routes/AddonListPage";
import { HomePage } from "@/routes/HomePage";
import { MentionsPage } from "@/routes/MentionsPage";
import { ProfilePage } from "@/routes/ProfilePage";
import { SearchPage } from "@/routes/SearchPage";
import { UserPage } from "@/routes/UserPage";

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

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/mentions", element: <MentionsPage /> },
      { path: "/plugins", element: <AddonListPage kind="plugin" /> },
      { path: "/components", element: <AddonListPage kind="component" /> },
      { path: "/themes", element: <AddonListPage kind="theme" /> },
      { path: "/templates", element: <AddonListPage kind="template" /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/u/:slug", element: <UserPage /> },
      { path: "*", element: <Placeholder name="Not found" /> },
    ],
  },
]);
