-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Component" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Component_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Component" ("slug", "tags", "userId") SELECT "slug", "tags", "userId" FROM "Component";
DROP TABLE "Component";
ALTER TABLE "new_Component" RENAME TO "Component";
CREATE UNIQUE INDEX "Component_slug_key" ON "Component"("slug");
CREATE TABLE "new_Plugin" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Plugin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Plugin" ("slug", "tags", "userId") SELECT "slug", "tags", "userId" FROM "Plugin";
DROP TABLE "Plugin";
ALTER TABLE "new_Plugin" RENAME TO "Plugin";
CREATE UNIQUE INDEX "Plugin_slug_key" ON "Plugin"("slug");
CREATE TABLE "new_Theme" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Theme" ("slug", "tags", "userId") SELECT "slug", "tags", "userId" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
