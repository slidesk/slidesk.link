import { db } from "../../db";
import type { WriteResult } from "../types";

// Scoped to the owner: a renew for someone else's id must report 0 rows rather
// than reset their 72h window.
const renew = db.query(
  `UPDATE "HostedPresentation"
      SET createdAt = $createdAt
    WHERE id = $id AND userId = $userId`,
);

export default async (id: string, userId: number): Promise<WriteResult> => ({
  count: renew.run({ id, userId, createdAt: Date.now() }).changes,
});
