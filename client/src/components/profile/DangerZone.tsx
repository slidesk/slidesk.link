import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    await api.deleteAccount();
    window.location.href = "/exit";
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete my account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your profile, talks, hosted presentations
              and addons. This cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction disabled={busy} onClick={remove}>
                {busy ? "Deleting…" : "Delete everything"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
