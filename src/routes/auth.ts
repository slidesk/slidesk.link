import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import getToken from "../database/user/getToken";
import { JWT_SECRET } from "../services/env";

/** The CLI listens on 1337 unless that port is taken; older CLIs do not say. */
const cliPort = (value: unknown) => {
  const port = Number(value);
  return Number.isInteger(port) && port >= 1024 && port <= 65535 ? port : null;
};

const auth = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    }),
  )
  .get("/", async ({ jwt, cookie: { auth, cli }, query, redirect }) => {
    const port = cliPort(query.port) ?? cliPort(cli.value) ?? 1337;
    const profile = await jwt.verify(auth.value as string);
    if (!profile) {
      // remembered so that the GitHub login comes back here, see routes/login
      cli.set({ value: String(port), path: "/", maxAge: 600, httpOnly: true });
      return redirect("/login");
    }
    cli.remove();
    const token = await getToken(Number(profile.id));
    return redirect(`http://localhost:${port}/auth/${token}`);
  });

export default auth;
