import { db } from "../../src/db";

/**
 * Seed helpers for the in-memory database that `tests/setup.ts` installs. The
 * whole suite shares one connection, so keep fixtures scoped to the ids and
 * slugs each test file owns rather than asserting on global row counts.
 */

export { db };

/** Insert a user and return its generated id. */
export const seedUser = (slug: string): number => {
  const now = Date.now();
  const row = db
    .query<{ id: number }, [Record<string, string | number>]>(
      `INSERT INTO "User" (slug, name, token, createdAt, updatedAt)
            VALUES ($slug, $name, $token, $now, $now)
         RETURNING id`,
    )
    .get({ slug, name: slug, token: `token-${slug}`, now });
  return (row as { id: number }).id;
};

/** Insert a hosted presentation owned by `userId`. */
export const seedHosted = (
  id: string,
  userId: number,
  createdAt = Date.now(),
) =>
  db
    .query(
      `INSERT INTO "HostedPresentation" (id, userId, createdAt)
            VALUES ($id, $userId, $createdAt)`,
    )
    .run({ id, userId, createdAt });
