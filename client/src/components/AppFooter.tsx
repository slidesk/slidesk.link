import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border/60">
      <nav className="container flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            slidesk<span className="text-primary">.link</span>
          </span>
          <span className="text-xs">v{__APP_VERSION__}</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/slidesk/slidesk.link"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-foreground"
          >
            Source code
          </a>
          <Link
            to="/mentions"
            className="transition-colors hover:text-foreground"
          >
            Legal
          </Link>
        </div>
      </nav>
    </footer>
  );
}
