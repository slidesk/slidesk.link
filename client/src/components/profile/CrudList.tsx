import type { LucideIcon } from "lucide-react";
import { Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

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

export function ConfirmDelete({
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  trigger,
}: {
  onConfirm: () => void;
  title?: string;
  description?: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface CrudListProps<T> {
  title: string;
  icon?: LucideIcon;
  items: T[];
  getKey: (item: T) => string;
  primary: (item: T) => ReactNode;
  secondary?: (item: T) => ReactNode;
  onDelete: (item: T) => void;
  emptyText?: string;
}

export function CrudList<T>({
  title,
  icon: Icon,
  items,
  getKey,
  primary,
  secondary,
  onDelete,
  emptyText = "Nothing here yet.",
}: CrudListProps<T>) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            ({items.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li
                key={getKey(item)}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {primary(item)}
                  </span>
                  {secondary && (
                    <span className="truncate text-xs text-muted-foreground">
                      {secondary(item)}
                    </span>
                  )}
                </div>
                <ConfirmDelete
                  onConfirm={() => onDelete(item)}
                  description="This item will be permanently deleted."
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
