// Temporary one-off release task. Will be removed before merging.
// Supabase's transaction pooler (6543) is for app requests; migrations
// require the session pooler (5432). Never print DB credentials.
const { spawnSync } = require("node:child_process");
const raw = process.env.DATABASE_URL;
if (!raw) { console.error("DATABASE_URL is missing."); process.exit(1); }
const url = new URL(raw);
if (!url.hostname.endsWith(".pooler.supabase.com") || url.port !== "6543") {
  console.error("Expected Supabase transaction pooler configuration; refusing to guess a migration target.");
  process.exit(1);
}
url.port = "5432";
const result = spawnSync("./node_modules/.bin/prisma", ["migrate", "deploy"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url.toString() },
  timeout: 120000,
});
if (result.error) console.error("Migration command failed:", result.error.message);
process.exit(result.status === 0 ? 0 : 1);
