import { db } from "../../db";

const tokenById = db.query<{ token: string }, [{ id: number }]>(
  `SELECT token FROM "User" WHERE id = $id LIMIT 1`,
);

export default async (id: number): Promise<string | null> =>
  tokenById.get({ id })?.token || null;
