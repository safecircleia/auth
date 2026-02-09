import "server-only";
import { headers } from "next/headers";
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";
import { twoFactorClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { phoneNumberClient } from "better-auth/client/plugins";
import { apiKeyClient } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { env } from "@sc-auth/env/web";

const BETTER_AUTH_COOKIE_PREFIX = "sc";

/**
 * Better Auth client for Server-side usage (Server Components, Server Actions, etc.)
 *
 * Uses `better-auth/react` so inferred session types match the client-side `authClient`
 * (plugin-extended fields like `twoFactorEnabled`, `banned`, etc. are included).
 * Guarded by `import "server-only"` to prevent accidental use in Client Components.
 *
 * Automatically proxies auth cookies from the incoming request to the separate backend
 * via the `onRequest` hook — no need to manually pass headers on each call.
 */
export const authServerClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    // twoFactorClient(),
    polarClient(),
    passkeyClient(),
    emailOTPClient(),
    adminClient(),
    deviceAuthorizationClient(),
    jwtClient(),
    oauthProviderClient(),
    apiKeyClient(),
    organizationClient(),
    phoneNumberClient(),
  ],
  fetchOptions: {
    onRequest: async (context) => {
      const headersList = await headers();
      const cookie = headersList.get("Cookie");

      if (cookie) {
        const authCookies = cookie
          .split(";")
          .map((c) => c.trim())
          .filter(
            (c) =>
              c.startsWith(`${BETTER_AUTH_COOKIE_PREFIX}.`) ||
              c.startsWith(`__Secure-${BETTER_AUTH_COOKIE_PREFIX}.`),
          )
          .join("; ");

        if (authCookies) {
          context.headers.set("Cookie", authCookies);
        }
      }
    },
  },
});
