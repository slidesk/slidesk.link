import { Link2 } from "lucide-react";

import { CopyButton } from "@/components/CopyButton";
import { DownloadBadge } from "@/components/DownloadBadge";
import { HtmlContent } from "@/components/HtmlContent";
import { InstallCommand } from "@/components/InstallCommand";
import { Card } from "@/components/ui/card";
import { addonAnchorId } from "@/lib/addon-groups";
import { ADDON_META, installCommand } from "@/lib/addon-meta";
import type { AddonKind, SearchAddon } from "@/types/api";

export function AddonCard({
  kind,
  addon,
}: {
  kind: AddonKind;
  addon: SearchAddon;
}) {
  const id = addonAnchorId(addon.user, addon.slug);
  const link = `${window.location.origin}${ADDON_META[kind].path}#${id}`;

  return (
    <Card
      id={id}
      className="flex scroll-mt-24 flex-col gap-3 p-4 transition-colors hover:border-border/80"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <CopyButton
            text={link}
            message="Link copied!"
            label="Copy link to this addon"
            className="h-7 w-7 text-muted-foreground"
          />
          <h3 className="truncate font-semibold">
            {addon.slug}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              @{addon.user}
            </span>
          </h3>
        </div>
        <DownloadBadge count={addon.downloaded} />
      </div>

      {addon.description && <HtmlContent html={addon.description} />}

      <div className="mt-auto pt-1">
        <InstallCommand
          command={installCommand(kind, addon.user, addon.slug)}
        />
      </div>
    </Card>
  );
}

// Icon-only affordance kept for potential inline use.
export const AnchorIcon = Link2;
