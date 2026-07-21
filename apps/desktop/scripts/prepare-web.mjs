// Build apps/web and copy its dist into web-dist/ for packaging.
// The desktop app ships byte-identical app code to what a community
// node serves — one bundle for web, node, drive, and desktop.
import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(here, "..");
const repoRoot = path.join(desktopRoot, "..", "..");
const webDist = path.join(repoRoot, "apps", "web", "dist");
const target = path.join(desktopRoot, "web-dist");

execSync("npm run build --workspace=@understoria/web", {
  cwd: repoRoot,
  stdio: "inherit",
});

if (!existsSync(path.join(webDist, "index.html"))) {
  console.error(`web build produced no index.html at ${webDist}`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(webDist, target, { recursive: true });
console.log(`web-dist ready: ${target}`);
