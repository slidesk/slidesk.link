import { Elysia } from "elysia";
import userHTML from "../views/html/user.html" with { type: "text" };

const user = new Elysia({ prefix: "/u" }).get(
  "/:user",
  ({ params: { user } }) => {
    console.log(user);
    return new Response(userHTML, { headers: { "Content-Type": "text/html" } });
  },
);

export default user;
