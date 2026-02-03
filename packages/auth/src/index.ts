import { polar, checkout, portal } from "@polar-sh/better-auth";
import { db } from "@sc-auth/db";
import * as schema from "@sc-auth/db/schema/auth";
import { env } from "@sc-auth/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { polarClient } from "./lib/payments";
import { twoFactor } from "better-auth/plugins";
import { phoneNumber } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { admin } from "better-auth/plugins";
import { apiKey } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { deviceAuthorization } from "better-auth/plugins";
import { haveIBeenPwned } from "better-auth/plugins";
import { lastLoginMethod } from "better-auth/plugins";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN, "sc-auth://", "exp://"],
  appName: "SafeCircle",
  emailAndPassword: {
    enabled: true,
  },
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 60,
  //   },
  // },
  // secret: "dasdasda", // Use this to generate DB schema
  // baseURL: "http://localhost:3000",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "<your-workers-subdomain>",
    // },
  },
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  //   microsoft: {
  //     clientId: process.env.MICROSOFT_CLIENT_ID!,
  //     clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  //   },
  //   tiktok: {
  //     clientId: process.env.TIKTOK_CLIENT_ID!,
  //     clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
  //   },
  //   twitter: {
  //     clientId: process.env.TWITTER_CLIENT_ID!,
  //     clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  //   },
  //   discord: {
  //     clientId: process.env.DISCORD_CLIENT_ID!,
  //     clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  //   },
  // },
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
          // successUrl: env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
    expo(),
    lastLoginMethod(),
    haveIBeenPwned(),
    deviceAuthorization({
      verificationUri: "/device",
    }),
    organization(),
    apiKey(),
    admin(),
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, token, url }, ctx) => {
        // send email to user
      },
    }),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, ctx) => {
        // Implement sending OTP code via SMS
      },
    }),
    twoFactor(),
    jwt(),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/consent",
    }),
  ],
});
