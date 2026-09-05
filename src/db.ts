import { Database } from "bun:sqlite";
import { migrate } from "./database/migrate";

/**
 * The sqlite connection shared by every query in `src/database`. `strict: true`
 * lets prepared statements bind named parameters without the `$` prefix.
 */
export const db = new Database(
  Bun.env.DATABASE_PATH ?? `${process.cwd()}/app/dev.db`,
  { create: true, strict: true },
);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA busy_timeout = 5000");

// Provisions a fresh file and upgrades an existing one; see database/migrations.
migrate(db);
