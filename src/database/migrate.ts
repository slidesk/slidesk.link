import type { Database } from "bun:sqlite";
import { MIGRATIONS } from "./migrations";

/** Highest version in `MIGRATIONS`; the version a migrated database ends up at. */
export const LATEST_VERSION = MIGRATIONS.reduce(
  (latest, migration) => Math.max(latest, migration.version),
  0,
);

// A duplicated or out-of-order version would silently skip a migration on the
// databases that sit between the two, so fail loudly at import time instead.
MIGRATIONS.reduce((previous, { version }) => {
  if (!Number.isInteger(version) || version <= previous) {
    throw new Error(
      `Migration versions must be increasing positive integers, got ${version} after ${previous}`,
    );
  }
  return version;
}, 0);

export const currentVersion = (db: Database): number =>
  db.query<{ user_version: number }, []>("PRAGMA user_version").get()
    ?.user_version ?? 0;

/**
 * Bring `db` up to `LATEST_VERSION`, applying each pending migration in its own
 * transaction so a failure leaves the database on the last version that fully
 * applied. Already-migrated databases do no work.
 */
export const migrate = (db: Database): number => {
  const from = currentVersion(db);

  for (const { version, name, sql } of MIGRATIONS) {
    if (version <= from) continue;
    db.transaction(() => {
      db.exec(sql);
      // PRAGMA does not take bound parameters; `version` is an integer from the
      // list above, validated at import time, never user input.
      db.exec(`PRAGMA user_version = ${version}`);
    })();
    console.log(`db: migration ${version}_${name} applied`);
  }

  return LATEST_VERSION;
};
