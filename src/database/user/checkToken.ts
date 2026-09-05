import { db } from "../../db";
import { type Stored, toUser } from "../rows";
import type { User } from "../types";

const byToken = db.query<Stored<User>, [{ token: string }]>(
  `SELECT * FROM "User" WHERE token = $token LIMIT 1`,
);

export default async (token: string): Promise<User | null> => {
  const row = byToken.get({ token });
  return row && toUser(row);
};
