import { db } from "../../db";
import { type Stored, toUser } from "../rows";
import type { User } from "../types";

const byGithubId = db.query<Stored<User>, [{ githubId: number }]>(
  `SELECT * FROM "User" WHERE githubId = $githubId LIMIT 1`,
);

export default async (githubId: number): Promise<User | null> => {
  const row = byGithubId.get({ githubId });
  return row && toUser(row);
};
