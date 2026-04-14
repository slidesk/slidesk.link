import { PrismaClient } from "./generated/prisma/client";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

const adapter = new PrismaBunSqlite({
  url: "file:./app/dev.db",
});
export const db = new PrismaClient({ adapter });
