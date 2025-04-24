import { rmSync } from "node:fs";
import { db } from "../db";
import deleteHostedPresentations from "../database/deleteHostedPresentations";

export default async () => {
  const ids = (
    await db.hostedPresentation.findMany({
      select: { id: true },
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    })
  ).map((i) => i.id);
  ids.forEach((id, _) => {
    rmSync(`${process.cwd()}/presentations/${id}`, {
      recursive: true,
      force: true,
    });
  });
  await deleteHostedPresentations(ids);
};
