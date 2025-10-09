import { rmSync } from "node:fs";
import deleteHostedPresentations from "../database/hostedPresentation/deletes";
import { db } from "../db";
import createUserPage from "./createUserPage";

export default async () => {
  const ids = (
    await db.hostedPresentation.findMany({
      select: { id: true },
      where: { createdAt: { lt: new Date(Date.now() - 72 * 60 * 60 * 1000) } },
    })
  ).map((i) => i.id);
  ids.forEach((id, _) => {
    rmSync(`${process.cwd()}/app/presentations/${id}`, {
      recursive: true,
      force: true,
    });
  });
  await deleteHostedPresentations(ids);

  const users = await db.user.findMany();
  for await (const u of users) {
    await createUserPage(u);
  }
};
