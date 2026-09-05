import { db } from "../../db";
import { type Stored, toUser } from "../rows";
import type { User } from "../types";

const byId = db.query<Stored<User>, [{ id: number }]>(
  `SELECT * FROM "User" WHERE id = $id LIMIT 1`,
);

export default async (id: number): Promise<User | null> => {
  const row = byId.get({ id });
  return row && toUser(row);
};
