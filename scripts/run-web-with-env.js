#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");
const fs = require("fs");

const rootDir = path.resolve(__dirname, "..");
const envFiles = [".env", ".env.local"];

for (const envFile of envFiles) {
  dotenv.config({
    path: path.join(rootDir, envFile),
    override: envFile === ".env.local",
    quiet: true,
  });
}

const [script, ...args] = process.argv.slice(2);

if (!script) {
  console.error("Missing web script name.");
  process.exit(1);
}

const workspaceArgs = [
  "--workspace",
  "@mindpoint/web",
  "run",
  script,
  ...(args.length > 0 ? ["--", ...args] : []),
];

const npmExecPath = process.env.npm_execpath;
const command =
  npmExecPath && fs.existsSync(npmExecPath)
    ? process.execPath
    : process.platform === "win32"
      ? "npm.cmd"
      : "npm";
const commandArgs =
  npmExecPath && fs.existsSync(npmExecPath) ? [npmExecPath, ...workspaceArgs] : workspaceArgs;

const child = spawn(command, commandArgs, {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Failed to start web ${script} script:`, error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
