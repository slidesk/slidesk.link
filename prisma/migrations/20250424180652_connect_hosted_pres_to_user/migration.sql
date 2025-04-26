/*
  Warnings:

  - Added the required column `userId` to the `HostedPresentation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HostedPresentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HostedPresentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HostedPresentation" ("createdAt", "id") SELECT "createdAt", "id" FROM "HostedPresentation";
DROP TABLE "HostedPresentation";
ALTER TABLE "new_HostedPresentation" RENAME TO "HostedPresentation";
CREATE UNIQUE INDEX "HostedPresentation_id_key" ON "HostedPresentation"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
