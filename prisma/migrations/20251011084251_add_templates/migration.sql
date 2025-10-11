-- CreateTable
CREATE TABLE "Template" (
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_userId_slug_key" ON "Template"("userId", "slug");
