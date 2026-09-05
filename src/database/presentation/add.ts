import { db } from "../../db";
import { type Stored, toPresentation } from "../rows";
import type { Presentation } from "../types";

const insert = db.query<
  Stored<Presentation>,
  [Omit<Stored<Presentation>, "id">]
>(
  `INSERT INTO "Presentation" (userId, title, abstract, url, createdAt, updatedAt)
        VALUES ($userId, $title, $abstract, $url, $createdAt, $updatedAt)
     RETURNING *`,
);

export default async (presentation: {
  userId: number;
  title: string;
  abstract?: string;
  url?: string;
}): Promise<Presentation> => {
  const now = Date.now();
  return toPresentation(
    insert.get({
      userId: presentation.userId,
      title: presentation.title,
      abstract: presentation.abstract ?? null,
      url: presentation.url ?? null,
      createdAt: now,
      updatedAt: now,
    }) as Stored<Presentation>,
  );
};
