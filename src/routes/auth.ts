import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import getToken from "../database/user/getToken";
import { HOST_IS_HTTPS, JWT_SECRET } from "../services/env";

/** The CLI listens on 1337 unless that port is taken; older CLIs do not say. */
const cliPort = (value: unknown) => {
  const port = Number(value);
  return Number.isInteger(port) && port >= 1024 && port <= 65535 ? port : null;
};

/** The random value a CLI sends to recognise its own login coming back. */
const cliState = (value: unknown) =>
  typeof value === "string" && /^[\w-]{16,64}$/.test(value) ? value : null;

const auth = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    }),
  )
  .get(
    "/",
    async ({ jwt, cookie: { auth, cli, clistate }, query, redirect }) => {
      const port = cliPort(query.port) ?? cliPort(cli.value) ?? 1337;
      const state = cliState(query.state) ?? cliState(clistate.value);
      const profile = await jwt.verify(auth.value as string);
      if (!profile) {
        // remembered so that the GitHub login comes back here, see routes/login
        const remember = {
          path: "/",
          maxAge: 600,
          httpOnly: true,
          secure: HOST_IS_HTTPS,
        };
        cli.set({ value: String(port), ...remember });
        if (state) clistate.set({ value: state, ...remember });
        return redirect("/login?from=cli");
      }
      cli.remove();
      clistate.remove();
      const token = await getToken(Number(profile.id));
      // the CLI only accepts a token carrying the state it sent; older CLIs send none
      return redirect(
        `http://localhost:${port}/auth/${token}${state ? `?state=${state}` : ""}`,
      );
    },
  );

export default auth;
