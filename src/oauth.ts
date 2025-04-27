import oauth2, {
  github,
  type TOAuth2AccessToken,
} from "@bogeychan/elysia-oauth2";

import { randomBytes } from "node:crypto";

const globalState = randomBytes(8).toString("hex");
let globalToken: TOAuth2AccessToken | undefined;

const oauth = oauth2({
  profiles: {
    github: {
      provider: github(),
      scope: ["user"],
    },
  },
  state: {
    check(_ctx, _name, state) {
      return state === globalState;
    },
    generate(_ctx, _name) {
      return globalState;
    },
  },
  storage: {
    get(_ctx, _name) {
      return globalToken;
    },
    set(_ctx, _name, token) {
      globalToken = token;
    },
    delete(_ctx, _name) {
      globalToken = undefined;
    },
  },
  host: "slidesk.link",
});

export default oauth;
