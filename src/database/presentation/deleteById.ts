import { db } from "../../db";
import type { WriteResult } from "../types";

const remove = db.query(`DELETE FROM "Presentation" WHERE id = $id`);

export default async (id: number): Promise<WriteResult> => ({
  count: remove.run({ id }).changes,
});
