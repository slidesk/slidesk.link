import { db } from "../../db";
import { type Stored, toPresentation } from "../rows";
import type { Presentation } from "../types";

const byTitleAndUser = db.query<
  Stored<Presentation>,
  [{ title: string; userId: number }]
>(
  `SELECT * FROM "Presentation"
    WHERE title = $title AND userId = $userId
    LIMIT 1`,
);

export default async (
  title: string,
  userId: number,
): Promise<Presentation | null> => {
  const row = byTitleAndUser.get({ title, userId });
  return row && toPresentation(row);
};
