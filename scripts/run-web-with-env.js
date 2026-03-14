#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "..");
const envFiles = [".env", ".env.local"];

for (const envFile of envFiles) {
  dotenv.config({
    path: path.join(rootDir, envFile),
    override: envFile === ".env.local",
  });
}

const [script, ...args] = process.argv.slice(2);

if (!script) {
  console.error("Missing web script name.");
  process.exit(1);
}

const child = spawn(
  "bun",
  ["run", "--cwd", "apps/web", script, ...args],
  {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
