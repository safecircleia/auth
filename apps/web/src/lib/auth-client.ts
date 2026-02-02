import { passkeyClient } from "@better-auth/passkey/client";
import { polarClient } from "@polar-sh/better-auth";
import { env } from "@sc-auth/env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [polarClient(), passkeyClient()],
});
