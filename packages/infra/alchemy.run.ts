import alchemy from "alchemy";
import { Nextjs } from "alchemy/cloudflare";
import { Worker } from "alchemy/cloudflare";
import { D1Database } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
// import { GitHubComment } from "alchemy/github";
import { config } from "dotenv";

const stage = process.env.ALCHEMY_STAGE || "prod";

if (stage === "prod") {
  config({ path: "./.env.production" });
  config({ path: "../../apps/server/.env.production" });
  config({ path: "../../apps/web/.env.production" });
} else {
  config({ path: "./.env" });
  config({ path: "../../apps/web/.env" });
  config({ path: "../../apps/server/.env" });
}

const app = await alchemy("sc-auth", {
  stateStore: (scope) =>
    new CloudflareStateStore(scope, {
      scriptName: "sc-auth-state-store",
    }),
});

const db = await D1Database("database", {
  name: "sc-auth",
  migrationsDir: "../../packages/db/src/migrations",
  adopt: true,
});

export const web = await Nextjs("web", {
  adopt: true,
  name: "sc-auth-frontend",
  cwd: "../../apps/web",
  bindings: {
    NEXT_PUBLIC_SERVER_URL: alchemy.env.NEXT_PUBLIC_SERVER_URL!,
  },
  dev: {
    env: {
      PORT: "3001",
    },
  },
});

export const server = await Worker("server", {
  name: "sc-auth-backend",
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    POLAR_ACCESS_TOKEN: alchemy.secret.env.POLAR_ACCESS_TOKEN!,
    POLAR_SUCCESS_URL: alchemy.env.POLAR_SUCCESS_URL!,
    RESEND_API_KEY: alchemy.secret.env.RESEND_API_KEY!,
  },
  dev: {
    port: 3000,
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

// if (process.env.PULL_REQUEST) {
//   // if this is a PR, add a comment to the PR with the preview URL
//   // it will auto-update with each push
//   await GitHubComment("preview-comment", {
//     owner: "safecircleia",
//     repository: "auth",
//     issueNumber: Number(process.env.PULL_REQUEST),
//     body: `## 🚀 Preview Deployed

// Your changes have been deployed to a preview environment:

// **🌐 Website:** ${web.url}

// Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

// ---
// <sub>🤖 This comment updates automatically with each push.</sub>`,
//   });
// }

await app.finalize();
