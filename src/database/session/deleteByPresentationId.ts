import { db } from "../../db";
import type { WriteResult } from "../types";

const remove = db.query(
  `DELETE FROM "Session" WHERE presentationId = $presentationId`,
);

export default async (presentationId: number): Promise<WriteResult> => ({
  count: remove.run({ presentationId }).changes,
});
