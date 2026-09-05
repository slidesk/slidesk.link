import { beforeAll, describe, expect, test } from "bun:test";
import { db, seedHosted, seedUser } from "./helpers/db";

let renew: (id: string, userId: number) => Promise<{ count: number }>;
let userId: number;
let otherId: number;

const createdAtOf = (id: string) =>
  (
    db
      .query<{ createdAt: number }, [{ id: string }]>(
        `SELECT createdAt FROM "HostedPresentation" WHERE id = $id`,
      )
      .get({ id }) as { createdAt: number }
  ).createdAt;

beforeAll(async () => {
  ({ default: renew } = await import(
    "../src/database/hostedPresentation/renew"
  ));
  userId = seedUser("renewer");
  otherId = seedUser("stranger");
  seedHosted("mine", userId, 1_000);
  seedHosted("theirs", otherId, 1_000);
});

describe("renew", () => {
  test("pushes createdAt to now for a row the user owns", async () => {
    const before = Date.now();
    expect(await renew("mine", userId)).toEqual({ count: 1 });
    expect(createdAtOf("mine")).toBeGreaterThanOrEqual(before);
  });

  test("returns { count: 0 } when the row is not owned by the user", async () => {
    expect(await renew("theirs", userId)).toEqual({ count: 0 });
    expect(createdAtOf("theirs")).toBe(1_000);
  });

  test("returns { count: 0 } for an unknown id", async () => {
    expect(await renew("nonexistent", userId)).toEqual({ count: 0 });
  });
});
