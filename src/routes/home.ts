import { Elysia } from "elysia";
import homeHTML from "../views/html/home.html" with { type: "text" };

const home = new Elysia().get("/", () => {
  return new Response(homeHTML, { headers: { "Content-Type": "text/html" } });
});

export default home;
