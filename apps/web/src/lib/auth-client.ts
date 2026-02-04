import { passkeyClient } from "@better-auth/passkey/client";
import { polarClient } from "@polar-sh/better-auth";
import { env } from "@sc-auth/env/web";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { phoneNumberClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { lastLoginMethodClient } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    twoFactorClient(),
    polarClient(),
    passkeyClient(),
    emailOTPClient(),
    phoneNumberClient(),
    adminClient(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
    jwtClient(),
  ],
});
