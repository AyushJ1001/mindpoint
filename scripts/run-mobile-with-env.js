#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "..");
const mobileDir = path.join(rootDir, "apps/mobile");
const envFiles = [".env", ".env.local"];

for (const envFile of envFiles) {
  dotenv.config({
    path: path.join(rootDir, envFile),
    override: envFile === ".env.local",
  });
}

const [script, ...args] = process.argv.slice(2);

if (!script) {
  console.error("Missing mobile script name.");
  process.exit(1);
}

const expoCliPath = require.resolve("expo/bin/cli", {
  paths: [mobileDir, rootDir],
});

const scriptArgsByName = {
  android: ["start", "--android"],
  ios: ["start", "--ios"],
  start: ["start"],
  web: ["start", "--web"],
  "run:ios": ["run:ios"],
  "run:android": ["run:android"],
};

const expoArgs = scriptArgsByName[script] || [script];
const command = process.execPath;
const commandArgs = [expoCliPath, ...expoArgs, ...args];

const child = spawn(command, commandArgs, {
  cwd: mobileDir,
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Failed to start mobile ${script} script:`, error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
