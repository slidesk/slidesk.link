import type { HostedPresentation, Presentation, Session, User } from "./types";

/** The same row as it comes out of sqlite, with dates still stored as numbers. */
export type Stored<T> = {
  [K in keyof T]: T[K] extends Date ? number : T[K];
};

// The mappers pick their columns explicitly rather than spreading the row: a
// joined `SELECT` carries extra columns (including the author's token) that must
// never end up on the returned entity.

export const toUser = (row: Stored<User>): User => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  bio: row.bio,
  url: row.url,
  avatarUrl: row.avatarUrl,
  token: row.token,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
  githubId: row.githubId,
});

export const toPresentation = (row: Stored<Presentation>): Presentation => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  abstract: row.abstract,
  url: row.url,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

export const toSession = (row: Stored<Session>): Session => ({
  id: row.id,
  presentationId: row.presentationId,
  location: row.location,
  slides: row.slides,
  url: row.url,
  video: row.video,
  status: row.status,
  date: new Date(row.date),
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

export const toHostedPresentation = (
  row: Stored<HostedPresentation>,
): HostedPresentation => ({
  id: row.id,
  userId: row.userId,
  createdAt: new Date(row.createdAt),
});

const USER_COLUMNS = [
  "id",
  "slug",
  "name",
  "bio",
  "url",
  "avatarUrl",
  "token",
  "createdAt",
  "updatedAt",
  "githubId",
] as const;

/**
 * `SELECT` fragment for a join against `"User" u`, aliasing every user column
 * with a `user_` prefix so it cannot collide with the host table's own
 * id/url/createdAt/updatedAt.
 */
export const USER_JOIN_COLUMNS = USER_COLUMNS.map(
  (column) => `u."${column}" AS "user_${column}"`,
).join(", ");

export type JoinedUserRow = {
  [K in keyof Stored<User> as `user_${K}`]: Stored<User>[K];
};

/** Rebuild the user entity from the `user_`-prefixed columns of a joined row. */
export const toJoinedUser = (row: JoinedUserRow): User =>
  toUser({
    id: row.user_id,
    slug: row.user_slug,
    name: row.user_name,
    bio: row.user_bio,
    url: row.user_url,
    avatarUrl: row.user_avatarUrl,
    token: row.user_token,
    createdAt: row.user_createdAt,
    updatedAt: row.user_updatedAt,
    githubId: row.user_githubId,
  });

/**
 * Escape a user-supplied search term for a `LIKE '%' || ? || '%' ESCAPE '\'`
 * filter so `%` and `_` match literally instead of acting as wildcards.
 */
export const likeTerm = (term: string) => term.replace(/[\\%_]/g, "\\$&");
