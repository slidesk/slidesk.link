import { db } from "../../db";
import type { WriteResult } from "../types";

const remove = db.query(`DELETE FROM "User" WHERE id = $id`);

export default async (userId: number): Promise<WriteResult> => ({
  count: remove.run({ id: userId }).changes,
});
