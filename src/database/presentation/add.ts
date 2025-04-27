import { db } from "../../db";

export default async (presentation: {
  userId: number;
  title: string;
  abstract?: string;
  url?: string;
}) => await db.presentation.create({ data: presentation });
