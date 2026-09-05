import { db } from "../../db";
import type { WriteResult } from "../types";

const remove = db.query(`DELETE FROM "HostedPresentation" WHERE id = $id`);

export default async (id: string): Promise<WriteResult> => ({
  count: remove.run({ id }).changes,
});
