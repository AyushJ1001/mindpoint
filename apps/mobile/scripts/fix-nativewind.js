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
  const localPackageJson = path.join(localPath, "package.json");
  const rootPackageJson = path.join(rootPath, "package.json");

  if (!fs.existsSync(rootPackageJson)) continue;

  const rootVersion = JSON.parse(fs.readFileSync(rootPackageJson, "utf8")).version;
  const localVersion = fs.existsSync(localPackageJson)
    ? JSON.parse(fs.readFileSync(localPackageJson, "utf8")).version
    : null;

  if (localVersion === rootVersion) continue;

  fs.rmSync(localPath, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(localPath), { recursive: true });

  fs.cpSync(rootPath, localPath, { recursive: true });
  console.log(
    `[fix-nativewind] Synced ${pkg} ${localVersion ?? "(missing)"} -> ${rootVersion}`,
  );
}
