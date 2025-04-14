/*
  Warnings:

  - You are about to drop the column `github_id` on the `User` table. All the data in the column will be lost.
  - Added the required column `githubId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "url" TEXT,
    "avatarUrl" TEXT,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "githubId" INTEGER NOT NULL,
    "googleId" INTEGER NOT NULL
);
INSERT INTO "new_User" ("bio", "createdAt", "id", "name", "slug", "token", "updatedAt", "url") SELECT "bio", "createdAt", "id", "name", "slug", "token", "updatedAt", "url" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
