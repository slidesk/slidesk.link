import oauth2, {
  github,
  google,
  type TOAuth2AccessToken,
} from "@bogeychan/elysia-oauth2";

import { randomBytes } from "node:crypto";

const globalState = randomBytes(8).toString("hex");
let globalToken: TOAuth2AccessToken | undefined;

const oauth = oauth2({
  profiles: {
    // define multiple OAuth 2.0 profiles
    github: {
      provider: github(),
      scope: ["user"],
    },
    google: {
      provider: google(),
      scope: ["https://www.googleapis.com/auth/userinfo.profile"],
    },
  },
  state: {
    // custom state verification between requests
    check(_ctx, _name, state) {
      return state === globalState;
    },
    generate(_ctx, _name) {
      return globalState;
    },
  },
  storage: {
    // storage of users' access tokens is up to you
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
});

export default oauth;
