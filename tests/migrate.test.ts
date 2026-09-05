import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import {
  currentVersion,
  LATEST_VERSION,
  migrate,
} from "../src/database/migrate";
import { MIGRATIONS } from "../src/database/migrations";

const fresh = () => {
  const db = new Database(":memory:", { strict: true });
  db.exec("PRAGMA foreign_keys = ON");
  return db;
};

const tables = (db: Database) =>
  db
    .query<{ name: string }, []>(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
    )
    .all()
    .map((row) => row.name);

describe("migration list", () => {
  test("versions are increasing positive integers", () => {
    expect(MIGRATIONS.map((m) => m.version)).toEqual([1, 2]);
    expect(LATEST_VERSION).toBe(2);
  });

  test("every migration carries non-empty sql", () => {
    for (const migration of MIGRATIONS) {
      expect(migration.sql.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("migrate", () => {
  test("provisions a fresh database and stamps the latest version", () => {
    const db = fresh();
    expect(currentVersion(db)).toBe(0);
    expect(migrate(db)).toBe(LATEST_VERSION);
    expect(currentVersion(db)).toBe(LATEST_VERSION);
    expect(tables(db)).toEqual([
      "Component",
      "HostedPresentation",
      "Plugin",
      "Presentation",
      "Session",
      "Template",
      "Theme",
      "User",
    ]);
  });

  test("is idempotent", () => {
    const db = fresh();
    migrate(db);
    db.run(
      `INSERT INTO "User" (slug, name, token, createdAt, updatedAt) VALUES ('a', 'A', 't', 1, 2)`,
    );
    migrate(db);
    migrate(db);
    expect(currentVersion(db)).toBe(LATEST_VERSION);
    expect(db.query(`SELECT count(*) AS count FROM "User"`).get()).toEqual({
      count: 1,
    });
  });

  test("002 converts ISO text datetimes to unix milliseconds", () => {
    const db = fresh();
    // Stop at version 1, then seed the mixed-type rows a Prisma-era database has.
    for (const { version, sql } of MIGRATIONS.filter((m) => m.version === 1)) {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${version}`);
    }
    db.run(
      `INSERT INTO "User" (slug, name, token, createdAt, updatedAt)
            VALUES ('iso', 'Iso', 'tok', 1745746570937, '2026-07-22T23:15:00.946+00:00')`,
    );
    db.run(
      `INSERT INTO "HostedPresentation" (id, userId, createdAt)
            VALUES ('old', 1, '2026-07-22T23:15:00.946+00:00')`,
    );

    expect(migrate(db)).toBe(LATEST_VERSION);

    const user = db
      .query<{ createdAt: number; updatedAt: number; kind: string }, []>(
        `SELECT createdAt, updatedAt, typeof(updatedAt) AS kind FROM "User" WHERE slug = 'iso'`,
      )
      .get();
    expect(user?.kind).toBe("integer");
    expect(user?.updatedAt).toBe(Date.parse("2026-07-22T23:15:00.946Z"));
    // the integer column is left exactly as it was
    expect(user?.createdAt).toBe(1745746570937);

    const hosted = db
      .query<{ createdAt: number }, []>(
        `SELECT createdAt FROM "HostedPresentation" WHERE id = 'old'`,
      )
      .get();
    expect(hosted?.createdAt).toBe(Date.parse("2026-07-22T23:15:00.946Z"));
  });

  test("002 leaves unparseable text alone rather than nulling a NOT NULL column", () => {
    const db = fresh();
    db.exec(MIGRATIONS[0].sql);
    db.exec("PRAGMA user_version = 1");
    db.run(
      `INSERT INTO "User" (slug, name, token, createdAt, updatedAt)
            VALUES ('junk', 'Junk', 'tok2', 1, 'not-a-date')`,
    );
    migrate(db);
    expect(
      db.query(`SELECT updatedAt FROM "User" WHERE slug = 'junk'`).get(),
    ).toEqual({ updatedAt: "not-a-date" });
  });

  test("a database already at the latest version is not rewritten", () => {
    const db = fresh();
    migrate(db);
    db.run(
      `INSERT INTO "User" (slug, name, token, createdAt, updatedAt)
            VALUES ('keep', 'Keep', 'tok3', 1, '2026-07-22T23:15:00.946+00:00')`,
    );
    // 002 already ran, so the text value stays untouched on later boots
    migrate(db);
    expect(
      db.query(`SELECT updatedAt FROM "User" WHERE slug = 'keep'`).get(),
    ).toEqual({ updatedAt: "2026-07-22T23:15:00.946+00:00" });
  });
});
