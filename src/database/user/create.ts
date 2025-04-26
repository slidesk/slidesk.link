import { db } from "../../db";
import type { SlideskLinkUser } from "../../types";

export default async (user: SlideskLinkUser) =>
  await db.user.create({ data: user });
