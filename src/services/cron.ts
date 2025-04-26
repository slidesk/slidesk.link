import { rmSync } from "node:fs";
import { db } from "../db";
import deleteHostedPresentations from "../database/hostedPresentation/deletes";

export default async () => {
  const ids = (
    await db.hostedPresentation.findMany({
      select: { id: true },
      where: { createdAt: { lt: new Date(Date.now() - 72 * 60 * 60 * 1000) } },
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
