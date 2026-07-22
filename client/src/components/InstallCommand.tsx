import { CopyButton } from "@/components/CopyButton";

export function InstallCommand({ command }: { command: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 py-1 pl-3 pr-1">
      <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-foreground">
        {command}
      </code>
      <CopyButton
        text={command}
        message="Command copied!"
        label="Copy install command"
      />
    </div>
  );
}
