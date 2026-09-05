-- Every DATETIME cell is stored as unix milliseconds, but the previous Prisma
-- tooling wrote some of them as ISO strings. SQLite orders integers before text
-- whatever their value, so `ORDER BY` and `<` comparisons silently misbehave on
-- a mixed column (an ISO-dated hosted presentation would never expire).
--
-- Text that julianday() cannot parse is left alone rather than nulled out of a
-- NOT NULL column; offset-less timestamps are read as UTC, which is how Prisma
-- wrote them.

UPDATE "User" SET "createdAt" = CAST(ROUND((julianday("createdAt") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("createdAt") = 'text' AND julianday("createdAt") IS NOT NULL;
UPDATE "User" SET "updatedAt" = CAST(ROUND((julianday("updatedAt") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("updatedAt") = 'text' AND julianday("updatedAt") IS NOT NULL;

UPDATE "Presentation" SET "createdAt" = CAST(ROUND((julianday("createdAt") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("createdAt") = 'text' AND julianday("createdAt") IS NOT NULL;
UPDATE "Presentation" SET "updatedAt" = CAST(ROUND((julianday("updatedAt") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("updatedAt") = 'text' AND julianday("updatedAt") IS NOT NULL;

UPDATE "Session" SET "date" = CAST(ROUND((julianday("date") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("date") = 'text' AND julianday("date") IS NOT NULL;
UPDATE "Session" SET "createdAt" = CAST(ROUND((julianday("createdAt") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("createdAt") = 'text' AND julianday("createdAt") IS NOT NULL;
UPDATE "Session" SET "updatedAt" = CAST(ROUND((julianday("updatedAt") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("updatedAt") = 'text' AND julianday("updatedAt") IS NOT NULL;

UPDATE "HostedPresentation" SET "createdAt" = CAST(ROUND((julianday("createdAt") - 2440587.5) * 86400000) AS INTEGER)
 WHERE typeof("createdAt") = 'text' AND julianday("createdAt") IS NOT NULL;
