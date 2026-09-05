import { db } from "../../db";
import { type Stored, toPresentation } from "../rows";
import type { Presentation } from "../types";

const byIdAndUser = db.query<
  Stored<Presentation>,
  [{ id: number; userId: number }]
>(`SELECT * FROM "Presentation" WHERE id = $id AND userId = $userId LIMIT 1`);

export default async (
  id: number,
  userId: number,
): Promise<Presentation | null> => {
  const row = byIdAndUser.get({ id, userId });
  return row && toPresentation(row);
};
