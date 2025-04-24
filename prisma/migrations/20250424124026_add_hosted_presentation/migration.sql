-- CreateTable
CREATE TABLE "HostedPresentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "HostedPresentation_id_key" ON "HostedPresentation"("id");
