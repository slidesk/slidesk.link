import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { CodeBlock } from "@/components/CodeBlock";
import { HeroSteps } from "@/components/HeroSteps";
import { InstallCommand } from "@/components/InstallCommand";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentTitle } from "@/lib/hooks/use-document-title";
import { useMe } from "@/lib/queries";

const LINK_YML = `title: Your title
abstract: |
  Your abstract
url: https://www.host.tld/path/to/your/slides
sessions:
  - date: 2025-03-12
    location: A nice meetup
    link: https://www.your-event.tld/path/to/your/program
    slides: https://your.hosted.slides.tld
    video: https://www.your-video-provider.tld/path/to/your/video
    status: accepted | rejected | declined | pending
  - date: 2025-03-12
    location: Another nice meetup
    link: https://www.your-event.tld/path/to/your/program
    slides: https://your.hosted.slides.tld
    video: https://www.your-video-provider.tld/path/to/your/video`;

const PLUGIN_JSON = `{
  "addScripts": ["plugins/YOUR_PLUGIN/YOUR_PLUGIN.js"],
  "addStyles": ["plugins/YOUR_PLUGIN/YOUR_PLUGIN.css"],
  "tags": ["YOUR_PLUGIN", "and", "others", "tags", "to", "find", "it"]
}`;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function HomePage() {
  useDocumentTitle("SliDesk.link — A place for your slides");
  const { data: me } = useMe();

  return (
    <>
      <div className="gradient-hero border-b">
        <div className="container flex flex-col items-center gap-8 py-20 text-center">
          <div className="glow flex flex-col items-center gap-4">
            <Logo big />
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              A place for your slides
            </h1>
            <p className="max-w-xl text-balance text-muted-foreground">
              Host your presentations and publish plugins, components, themes
              and templates for the SliDesk community.
            </p>
          </div>
          {me ? (
            <Link to="/profile" className={buttonVariants({ size: "lg" })}>
              Go to your profile <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <a href="/login/" className={buttonVariants({ size: "lg" })}>
              Login with GitHub <ArrowRight className="h-4 w-4" />
            </a>
          )}
          <div className="w-full pt-4">
            <HeroSteps />
          </div>
        </div>
      </div>

      <main className="container space-y-16 py-16">
        <Section title="Add information to share your talks">
          <p className="text-muted-foreground">
            Add a{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              link.yml
            </code>{" "}
            at the root of your presentation to list every session where your
            talk is given.
          </p>
          <CodeBlock code={LINK_YML} language="yaml" filename="link.yml" />
        </Section>

        <Section title="Add your plugin to the HUB">
          <InstallCommand command="slidesk plugin push YOUR_PLUGIN" />
          <p className="text-muted-foreground">Others will install it with</p>
          <InstallCommand command="slidesk plugin install @YOUR_USER_SLUG/YOUR_PLUGIN" />
          <p className="text-muted-foreground">
            Write your{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              plugin.json
            </code>{" "}
            like this:
          </p>
          <CodeBlock
            code={PLUGIN_JSON}
            language="json"
            filename="plugin.json"
          />
          <p className="text-sm text-muted-foreground">
            The{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              README.md
            </code>{" "}
            is used as the description on your SliDesk.link page.
          </p>
        </Section>

        <Section title="Add your theme to the HUB">
          <InstallCommand command="slidesk theme push YOUR_THEME" />
          <p className="text-muted-foreground">
            Create a{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              README.md
            </code>{" "}
            in your folder to add a description. To add previews, create a{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              preview
            </code>{" "}
            sub-directory with{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">.webp</code>{" "}
            images (width 320px).
          </p>
        </Section>
      </main>
    </>
  );
}
