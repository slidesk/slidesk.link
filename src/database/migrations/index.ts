import initialSchema from "./001_initial_schema.sql" with { type: "text" };
import normalizeDatetimes from "./002_normalize_datetimes.sql" with {
  type: "text",
};

export type Migration = {
  /** The `PRAGMA user_version` this migration brings the database to. */
  version: number;
  name: string;
  sql: string;
};

/**
 * Every migration, in order. Imported statically rather than read from disk so
 * the SQL is embedded in the bundle the release image runs.
 *
 * To add one: create `NNN_name.sql` next to this file and append it here.
 * Migrations run inside a transaction, so they cannot toggle `PRAGMA
 * foreign_keys`; a migration that needs the 12-step table rebuild has to be
 * written against the pragma being ON.
 */
export const MIGRATIONS: Migration[] = [
  { version: 1, name: "initial_schema", sql: initialSchema },
  { version: 2, name: "normalize_datetimes", sql: normalizeDatetimes },
];
