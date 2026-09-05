import { db } from "../../db";
import { type Stored, toUser } from "../rows";
import type { User } from "../types";

// Only these columns can be written through the profile form; anything else in
// `data` is ignored rather than interpolated into the statement.
const EDITABLE = ["name", "slug", "url", "avatarUrl", "bio"] as const;

export default async (
  userid: number,
  data: { [key: string]: string },
): Promise<User | null> => {
  const columns = EDITABLE.filter((column) => column in data);
  const assignments = columns.map((column) => `"${column}" = $${column}`);
  const row = db
    .query<Stored<User>, [Record<string, string | number>]>(
      `UPDATE "User"
          SET ${[...assignments, "updatedAt = $updatedAt"].join(", ")}
        WHERE id = $id
    RETURNING *`,
    )
    .get({
      ...Object.fromEntries(columns.map((column) => [column, data[column]])),
      updatedAt: Date.now(),
      id: userid,
    });
  return row && toUser(row);
};
