import { beforeAll, describe, expect, test } from "bun:test";
import { seedHosted, seedUser } from "./helpers/db";

let getHostedsByUser: (
  userId: number,
) => Promise<{ id: string; createdAt: Date }[]>;
let userId: number;

beforeAll(async () => {
  ({ default: getHostedsByUser } = await import(
    "../src/database/hostedPresentation/getByUser"
  ));
  userId = seedUser("owner");
  const other = seedUser("other");
  seedHosted("oldest", userId, 1_000);
  seedHosted("newest", userId, 3_000);
  seedHosted("middle", userId, 2_000);
  seedHosted("not-mine", other, 4_000);
});

describe("getHostedsByUser", () => {
  test("sorts hosted presentations by createdAt descending", async () => {
    const rows = await getHostedsByUser(userId);
    expect(rows.map((r) => r.id)).toEqual(["newest", "middle", "oldest"]);
  });

  test("returns only the rows the user owns", async () => {
    const rows = await getHostedsByUser(userId);
    expect(rows.map((r) => r.id)).not.toContain("not-mine");
    expect(await getHostedsByUser(-1)).toEqual([]);
  });

  test("hydrates createdAt into a Date", async () => {
    const [newest] = await getHostedsByUser(userId);
    expect(newest.createdAt).toBeInstanceOf(Date);
    expect(newest.createdAt.getTime()).toBe(3_000);
  });
});
