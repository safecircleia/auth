import { polarClient } from "@polar-sh/better-auth";
import { env } from "@sc-auth/env/web";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { phoneNumberClient } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { adminClient } from "better-auth/client/plugins";
import { apiKey } from "better-auth/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { deviceAuthorizationClient } from "better-auth/client/plugins"; 
import { lastLoginMethodClient } from "better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    polarClient(),
    twoFactorClient(),
    phoneNumberClient(),
    emailOTPClient(),
    passkeyClient(),
    adminClient(),
    apiKey(),
    organizationClient(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
    oauthProviderClient(),
    oauthProviderResourceClient(),
  ],
});
