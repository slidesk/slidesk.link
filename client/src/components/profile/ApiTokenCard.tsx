import { CopyButton } from "@/components/CopyButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ApiTokenCard({ token }: { token: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API token</CardTitle>
        <CardDescription>
          Use this token with the SliDesk CLI (<code>x-slidesk</code> header).
          Keep it secret.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 py-1 pl-3 pr-1">
            <code className="flex-1 select-all overflow-x-auto whitespace-nowrap text-sm blur-sm transition hover:blur-none">
              {token}
            </code>
            <CopyButton
              text={token}
              message="Token copied!"
              label="Copy token"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No token available.</p>
        )}
      </CardContent>
    </Card>
  );
}
