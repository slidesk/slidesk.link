import { db } from "../../db";
import type { WriteResult } from "../types";

const remove = db.query(`DELETE FROM "Session" WHERE id = $id`);

export default async (id: number): Promise<WriteResult> => ({
  count: remove.run({ id }).changes,
});
