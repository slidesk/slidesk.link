import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveProfile } from "@/lib/queries";
import type { ProfileForm } from "@/types/api";

export function EditProfileForm({ initial }: { initial: ProfileForm }) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    slug: initial.slug ?? "",
    avatarUrl: initial.avatarUrl ?? "",
    url: initial.url ?? "",
    bio: initial.bio ?? "",
  });
  const save = useSaveProfile();

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(form, {
      onSuccess: () => toast.success("Profile saved"),
      onError: () => toast.error("Could not save profile"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit your profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              required
              pattern="[A-Za-z0-9_\-]+"
              value={form.slug}
              onChange={(e) => set("slug")(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={form.avatarUrl}
              onChange={(e) => set("avatarUrl")(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="url">Website</Label>
            <Input
              id="url"
              type="url"
              value={form.url}
              onChange={(e) => set("url")(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => set("bio")(e.target.value)}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              placeholder="Markdown supported"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
