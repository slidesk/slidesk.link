import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DownloadBadge({ count }: { count: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="gap-1 tabular-nums">
          <Download className="h-3 w-3" />
          {count}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{count} download(s)</TooltipContent>
    </Tooltip>
  );
}
