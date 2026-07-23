import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaBunSqlite({
  url: "file:./app/dev.db",
});
export const db = new PrismaClient({ adapter });
