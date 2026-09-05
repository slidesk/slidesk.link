import { rmSync } from "node:fs";
import deleteHostedPresentations from "../database/hostedPresentation/deletes";
import getExpiredHostedPresentations from "../database/hostedPresentation/getExpired";

export default async () => {
  const ids = await getExpiredHostedPresentations(
    new Date(Date.now() - 72 * 60 * 60 * 1000),
  );
  ids.forEach((id, _) => {
    rmSync(`${process.cwd()}/app/presentations/${id}`, {
      recursive: true,
      force: true,
    });
  });
  await deleteHostedPresentations(ids);
};
