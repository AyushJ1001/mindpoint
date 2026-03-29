/**
 * Fix NativeWind + TailwindCSS resolution in the monorepo.
 *
 * Problem: The web app uses tailwindcss v4 (hoisted to root node_modules).
 *          NativeWind requires tailwindcss v3 and is also hoisted to root,
 *          so it resolves tailwindcss v4 and crashes.
 *
 * Solution: Copy nativewind (and its peer react-native-css-interop) into
 *           mobile's local node_modules so it resolves tailwindcss v3
 *           (which is installed locally here).
 */
const fs = require("fs");
const path = require("path");

const mobileNodeModules = path.resolve(__dirname, "..", "node_modules");
const rootNodeModules = path.resolve(__dirname, "..", "..", "..", "node_modules");

const packages = ["nativewind", "react-native-css-interop"];

for (const pkg of packages) {
  const localPath = path.join(mobileNodeModules, pkg);
  const rootPath = path.join(rootNodeModules, pkg);

  // Skip if already exists locally or doesn't exist at root
  if (fs.existsSync(path.join(localPath, "package.json"))) continue;
  if (!fs.existsSync(path.join(rootPath, "package.json"))) continue;

  fs.cpSync(rootPath, localPath, { recursive: true });
  console.log(`[fix-nativewind] Copied ${pkg} to mobile node_modules`);
}
