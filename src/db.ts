import { PrismaClient } from "./generated/prisma/client";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

const adapter = new PrismaBunSqlite({
  url: Bun.env.DATABASE_URL ?? "",
});
export const db = new PrismaClient({ adapter });
