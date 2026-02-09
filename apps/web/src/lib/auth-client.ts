import { passkeyClient } from "@better-auth/passkey/client";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { polarClient } from "@polar-sh/better-auth";
import { env } from "@sc-auth/env/web";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";
import { apiKeyClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    // twoFactorClient({
    //   onTwoFactorRedirect() {
    //     // Redirect to the 2FA verification page when 2FA is required during sign-in
    //     window.location.href = "/two-factor";
    //   },
    // }),
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
});
