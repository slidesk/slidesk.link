import { db } from "../../db";

export default async (presentation: {
  id: number;
  userId: number;
  title: string;
  abstract?: string;
  url?: string;
}) =>
  await db.presentation.update({
    where: { id: presentation.id },
    data: presentation,
  });
