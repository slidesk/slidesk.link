import { db } from "../../db";
import type { Plugin, User } from "../../generated/prisma/client";

export type AddonKind = "plugin" | "component" | "theme" | "template";

// The four addon models (Plugin/Component/Theme/Template) are structurally
// identical, so a single row shape describes any of them.
export type AddonRow = Plugin;
export type AddonRowWithUser = AddonRow & { user: User };

// Minimal structural view of a Prisma model delegate. The concrete delegates
// are cast to this once below; keeping args as `unknown` avoids leaking the
// generated (and divergent) per-model input types into the generic layer.
interface AddonDelegate {
  findMany: (args?: unknown) => Promise<AddonRowWithUser[]>;
  findFirst: (args?: unknown) => Promise<AddonRow | null>;
  upsert: (args: unknown) => Promise<AddonRow>;
  delete: (args: unknown) => Promise<AddonRow>;
  update: (args: unknown) => Promise<AddonRow>;
}

export interface AddonRepository {
  upsert(
    slug: string,
    userId: number,
    tags: string,
    description: string,
  ): Promise<AddonRow>;
  search(term: string): Promise<AddonRowWithUser[]>;
  getByUser(userId: number): Promise<AddonRowWithUser[]>;
  getByUserAndSlug(userId: number, slug: string): Promise<AddonRow | null>;
  delete(userId: number, slug: string): Promise<AddonRow>;
  addDownload(
    userId: number,
    slug: string,
    downloaded: number,
  ): Promise<AddonRow>;
}

const build = (
  delegate: AddonDelegate,
  searchField: "tags" | "description",
): AddonRepository => ({
  upsert: (slug, userId, tags, description) =>
    delegate.upsert({
      create: { slug, userId, tags, description },
      update: { tags, description },
      where: { userId_slug: { userId, slug } },
    }),
  search: (term) =>
    delegate.findMany({
      where: {
        OR: [
          { slug: { contains: term } },
          { [searchField]: { contains: term } },
        ],
      },
      include: { user: true },
      orderBy: { slug: "asc" },
    }),
  getByUser: (userId) =>
    delegate.findMany({
      where: { userId: { equals: userId } },
      include: { user: true },
    }),
  getByUserAndSlug: (userId, slug) =>
    delegate.findFirst({
      where: { slug: { equals: slug }, userId: { equals: userId } },
    }),
  delete: (userId, slug) =>
    delegate.delete({ where: { userId_slug: { userId, slug } } }),
  addDownload: (userId, slug, downloaded) =>
    delegate.update({
      where: { userId_slug: { userId, slug } },
      data: { downloaded },
    }),
});

export const addonRepositories: Record<AddonKind, AddonRepository> = {
  plugin: build(db.plugin as unknown as AddonDelegate, "tags"),
  component: build(db.component as unknown as AddonDelegate, "tags"),
  theme: build(db.theme as unknown as AddonDelegate, "description"),
  template: build(db.template as unknown as AddonDelegate, "description"),
};

export const authorizedKinds = Object.keys(addonRepositories) as AddonKind[];

export const isAddonKind = (value: string): value is AddonKind =>
  Object.hasOwn(addonRepositories, value);
