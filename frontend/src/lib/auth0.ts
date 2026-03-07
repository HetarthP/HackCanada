import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: "https://dev-czwx72m6i5120vzj.us.auth0.com/api/v2/",
    scope: "openid profile email", // Optional: ensures standard scopes
  },
});
