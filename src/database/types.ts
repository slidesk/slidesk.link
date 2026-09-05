/**
 * Row shapes returned by the queries in `src/database`. DATETIME columns are
 * stored as unix milliseconds and hydrated into `Date` by the mappers in
 * `./rows`, so consumers keep working with real dates.
 */

export type User = {
  id: number;
  slug: string;
  name: string | null;
  bio: string | null;
  url: string | null;
  avatarUrl: string | null;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  githubId: number | null;
};

export type Presentation = {
  id: number;
  userId: number;
  title: string;
  abstract: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: number;
  presentationId: number;
  location: string;
  slides: string | null;
  url: string | null;
  video: string | null;
  status: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type HostedPresentation = {
  id: string;
  userId: number;
  createdAt: Date;
};

/** A row of any of the four structurally identical addon tables. */
export type Addon = {
  userId: number;
  slug: string;
  tags: string;
  description: string;
  downloaded: number;
};

/** Number of rows a write touched, mirroring the shape callers already read. */
export type WriteResult = { count: number };
