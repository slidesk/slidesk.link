-- Baseline schema. Every guard is `IF NOT EXISTS` on purpose: this migration
-- also runs against the databases provisioned by the previous Prisma
-- migrations, where it must be a no-op that simply stamps user_version = 1.

CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "url" TEXT,
    "avatarUrl" TEXT,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "githubId" INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_slug_key" ON "User"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "User_token_key" ON "User"("token");

CREATE TABLE IF NOT EXISTS "Presentation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Presentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "presentationId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "slides" TEXT,
    "url" TEXT,
    "video" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "HostedPresentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HostedPresentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- The four addon tables are structurally identical; see database/addon/repository.
CREATE TABLE IF NOT EXISTS "Plugin" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Plugin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Plugin_userId_slug_key" ON "Plugin"("userId", "slug");

CREATE TABLE IF NOT EXISTS "Component" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Component_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Component_userId_slug_key" ON "Component"("userId", "slug");

CREATE TABLE IF NOT EXISTS "Theme" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Theme_userId_slug_key" ON "Theme"("userId", "slug");

CREATE TABLE IF NOT EXISTS "Template" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Template_userId_slug_key" ON "Template"("userId", "slug");
