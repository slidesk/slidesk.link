import { beforeAll, describe, expect, test } from "bun:test";
import { db, seedHosted, seedUser } from "./helpers/db";

let canDrive: (id: string, token: string | undefined) => boolean;

beforeAll(async () => {
  ({ default: canDrive } = await import(
    "../src/database/hostedPresentation/canDrive"
  ));
  const userId = seedUser("speaker");
  seedHosted("protected", userId);
  db.query(
    `UPDATE "HostedPresentation" SET speakerToken = 'secret' WHERE id = 'protected'`,
  ).run();
  seedHosted("legacy", userId);
});

describe("canDrive", () => {
  test("lets the speaker drive with the token", () => {
    expect(canDrive("protected", "secret")).toBe(true);
  });

  test("keeps the audience read-only", () => {
    expect(canDrive("protected", undefined)).toBe(false);
    expect(canDrive("protected", "guess")).toBe(false);
  });

  test("keeps the open relay for talks hosted without a token", () => {
    expect(canDrive("legacy", undefined)).toBe(true);
  });

  test("refuses an unknown talk", () => {
    expect(canDrive("missing", undefined)).toBe(false);
  });
});
