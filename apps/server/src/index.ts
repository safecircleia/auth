import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@sc-auth/api/context";
import { appRouter } from "@sc-auth/api/routers/index";
import { auth } from "@sc-auth/auth";
import { env } from "@sc-auth/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  oauthProviderOpenIdConfigMetadata,
  oauthProviderAuthServerMetadata,
} from "@better-auth/oauth-provider";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Better Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// OAuth 2.1 / OIDC Well-Known Endpoints
// These are required for OAuth clients to discover your authorization server

// OpenID Connect Discovery endpoint
// Used by OIDC clients to discover configuration (required for "openid" scope)
app.get("/.well-known/openid-configuration", async (c) => {
  const handler = oauthProviderOpenIdConfigMetadata(auth);
  const response = await handler(c.req.raw);

  // Add CORS headers for local testing (e.g., MCP Inspector)
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Methods", "GET");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
});

// OAuth 2.1 Authorization Server Metadata endpoint (RFC 8414)
// Used by OAuth clients to discover authorization server capabilities
app.get("/.well-known/oauth-authorization-server", async (c) => {
  const handler = oauthProviderAuthServerMetadata(auth);
  const response = await handler(c.req.raw);

  // Add CORS headers for local testing (e.g., MCP Inspector)
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Methods", "GET");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
});

// Also handle the path-appended version for issuers with paths
// OAuth 2.1 spec uses path insertion: /.well-known/oauth-authorization-server/{issuer-path}
app.get("/.well-known/oauth-authorization-server/api/auth", async (c) => {
  const handler = oauthProviderAuthServerMetadata(auth);
  const response = await handler(c.req.raw);

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Methods", "GET");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
});

// TRPC handler
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

// Health check endpoint
app.get("/", (c) => {
  return c.text("OK");
});

export default app;
