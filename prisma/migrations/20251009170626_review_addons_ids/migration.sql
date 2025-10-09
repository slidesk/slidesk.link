/*
  Warnings:

  - Added the required column `id` to the `Component` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Plugin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Component" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Component_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Component" ("description", "downloaded", "slug", "tags", "userId") SELECT "description", "downloaded", "slug", "tags", "userId" FROM "Component";
DROP TABLE "Component";
ALTER TABLE "new_Component" RENAME TO "Component";
CREATE UNIQUE INDEX "Component_id_key" ON "Component"("id");
CREATE TABLE "new_Plugin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Plugin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Plugin" ("description", "downloaded", "slug", "tags", "userId") SELECT "description", "downloaded", "slug", "tags", "userId" FROM "Plugin";
DROP TABLE "Plugin";
ALTER TABLE "new_Plugin" RENAME TO "Plugin";
CREATE UNIQUE INDEX "Plugin_id_key" ON "Plugin"("id");
CREATE TABLE "new_Theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Theme" ("description", "downloaded", "slug", "tags", "userId") SELECT "description", "downloaded", "slug", "tags", "userId" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
CREATE UNIQUE INDEX "Theme_id_key" ON "Theme"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
