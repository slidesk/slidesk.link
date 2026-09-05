import { db } from "../../db";
import type { WriteResult } from "../types";

const update = db.query(
  `UPDATE "Presentation"
      SET userId = $userId,
          title = $title,
          abstract = $abstract,
          url = $url,
          updatedAt = $updatedAt
    WHERE id = $id`,
);

export default async (presentation: {
  id: number;
  userId: number;
  title: string;
  abstract?: string;
  url?: string;
}): Promise<WriteResult> => ({
  count: update.run({
    id: presentation.id,
    userId: presentation.userId,
    title: presentation.title,
    abstract: presentation.abstract ?? null,
    url: presentation.url ?? null,
    updatedAt: Date.now(),
  }).changes,
});
