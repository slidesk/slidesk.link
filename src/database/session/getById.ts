import { db } from "../../db";
import { type Stored, toSession } from "../rows";
import type { Session } from "../types";

const byId = db.query<Stored<Session>, [{ id: number }]>(
  `SELECT * FROM "Session" WHERE id = $id LIMIT 1`,
);

export default async (id: number): Promise<Session | null> => {
  const row = byId.get({ id });
  return row && toSession(row);
};
