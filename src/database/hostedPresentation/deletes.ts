import { db } from "../../db";
import type { WriteResult } from "../types";

const remove = db.query(
  `DELETE FROM "HostedPresentation"
    WHERE id IN (SELECT value FROM json_each($ids))`,
);

export default async (ids: string[]): Promise<WriteResult> => ({
  count: remove.run({ ids: JSON.stringify(ids) }).changes,
});
