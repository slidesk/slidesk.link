import { db } from "../../db";

export default async (session: {
  presentationId: number;
  location: string;
  date: Date;
  video?: string;
  url?: string;
  slides?: string;
  status: number;
}) => await db.session.create({ data: session });
