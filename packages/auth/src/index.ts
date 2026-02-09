import { polar, checkout, portal } from "@polar-sh/better-auth";
import { db } from "@sc-auth/db";
import * as schema from "@sc-auth/db/schema/auth";
import { env } from "@sc-auth/env/server";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { polarClient } from "./lib/payments";
import { sendOTPEmail, send2FAOTPEmail } from "./lib/email";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { admin } from "better-auth/plugins";
import { apiKey } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { deviceAuthorization } from "better-auth/plugins";
import { phoneNumber } from "better-auth/plugins";
import { expo } from "@better-auth/expo";

const isProduction = process.env.NODE_ENV === "production";

const authConfig = {
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  trustedOrigins: [
    env.CORS_ORIGIN,

    // Expo URLs
    "sc-auth://",
    "sc-companion://",

    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
  appName: "SafeCircle",
  emailAndPassword: {
    enabled: true,
  },
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwt", // or "jwt" or "jwe"
    },
    storeSessionInDatabase: true,
  },
  // secret: "dasdasda", // Use this to generate DB schema
  // baseURL: "http://localhost:3000",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    cookiePrefix: "sc",
    defaultCookieAttributes: {
      // In development: use "lax" with secure: false for localhost
      // In production: use "none" with secure: true for cross-origin requests
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      httpOnly: true,
    },
    // Only enable crossSubDomainCookies in production
    ...(isProduction && {
      crossSubDomainCookies: {
        enabled: true,
        domain: "tresillo.workers.dev",
      },
    }),
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID!,
      clientSecret: env.MICROSOFT_CLIENT_SECRET!,
    },
    twitter: {
      clientId: env.TWITTER_CLIENT_ID!,
      clientSecret: env.TWITTER_CLIENT_SECRET!,
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID!,
      clientSecret: env.DISCORD_CLIENT_SECRET!,
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            {
              productId: "your-product-id",
              slug: "pro",
            },
          ],
          successUrl: env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
    expo(),
    // lastLoginMethod(), // Temporaly disabled due to auth issues locally
    deviceAuthorization({
      verificationUri: "/device",
    }),
    organization(),
    apiKey(),
    admin(),
    passkey(),
    emailOTP({
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTPEmail({ to: email, otp, type });
      },
    }),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => {
        // Implement sending OTP code via SMS
        console.log(`Send OTP ${code} to ${phoneNumber}`);
      },
    }),
    twoFactor({
      // The issuer is displayed in authenticator apps (e.g., Google Authenticator)
      issuer: "SafeCircle Auth",
      // TOTP configuration
      totpOptions: {
        // Number of digits in the OTP code
        digits: 6,
        // Time period in seconds for TOTP code validity
        period: 30,
      },
      // OTP configuration (for email/SMS-based 2FA)
      otpOptions: {
        // Send OTP to user's email for 2FA verification
        async sendOTP({ user, otp }) {
          await send2FAOTPEmail({
            to: user.email,
            otp,
          });
        },
        // OTP validity period in minutes
        period: 5,
      },
      // Backup codes configuration
      backupCodeOptions: {
        // Number of backup codes to generate
        amount: 10,
        // Length of each backup code
        length: 10,
      },
      // Skip TOTP verification when enabling 2FA (user must verify before twoFactorEnabled is set to true)
      skipVerificationOnEnable: false,
    }),
    jwt(),
    oauthProvider({
      silenceWarnings: {
        oauthAuthServerConfig: true,
      },
      // Redirect pages - these should point to your frontend app
      // The plugin will redirect users to these pages during the OAuth flow
      loginPage: "/login",
      consentPage: "/consent",

      // Supported scopes for OAuth clients
      // These define what permissions clients can request
      scopes: [
        "openid", // Required for OIDC - returns user ID (sub claim)
        "profile", // Returns name, picture, given_name, family_name
        "email", // Returns email and email_verified
        "offline_access", // Returns a refresh token for long-lived access
        "read:organization", // Custom scope for organization access
      ],

      // Token expiration settings (in seconds)
      accessTokenExpiresIn: 3600, // 1 hour
      refreshTokenExpiresIn: 2592000, // 30 days
      idTokenExpiresIn: 36000, // 10 hours
      codeExpiresIn: 600, // 10 minutes

      // Dynamic client registration settings
      // Enable this to allow clients to register themselves
      allowDynamicClientRegistration: true,

      // WARNING: Only enable this for MCP or similar use cases
      // This allows public clients to register without authentication
      // allowUnauthenticatedClientRegistration: true,

      // Default scopes for dynamically registered clients
      clientRegistrationDefaultScopes: ["openid", "profile", "email"],

      // Additional allowed scopes beyond defaults for registered clients
      clientRegistrationAllowedScopes: ["offline_access", "read:organization"],

      // Custom claims to add to ID tokens
      customIdTokenClaims: ({ scopes }) => {
        const claims: Record<string, unknown> = {};

        // Add locale if profile scope is granted
        if (scopes.includes("profile")) {
          claims.locale = "en-US";
        }

        return claims;
      },

      // Custom claims to add to access tokens
      customAccessTokenClaims: ({ scopes, referenceId }) => {
        const claims: Record<string, unknown> = {};

        // Add organization info if organization scope is granted
        if (scopes.includes("read:organization") && referenceId) {
          claims["https://safecircle.com/org"] = referenceId;
        }

        return claims;
      },

      // Custom claims for the UserInfo endpoint
      customUserInfoClaims: ({ scopes }) => {
        const claims: Record<string, unknown> = {};

        if (scopes.includes("profile")) {
          claims.locale = "en-US";
        }

        return claims;
      },

      // Advertised metadata for discovery endpoints
      // This controls what's shown in .well-known endpoints
      advertisedMetadata: {
        scopes_supported: ["openid", "profile", "email", "offline_access"],
        claims_supported: [
          "sub",
          "name",
          "email",
          "email_verified",
          "picture",
          "locale",
        ],
      },

      // Storage method for client secrets
      // "hashed" is more secure (recommended for most cases)
      // "encrypted" is needed if disableJwtPlugin is true
      storeClientSecret: "hashed",

      // Storage method for tokens (refresh tokens and opaque access tokens)
      storeTokens: "hashed",
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig);

export type Auth = typeof auth;
