const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// In a monorepo with bun, packages like react-use-cart can resolve React
// from a different symlinked path. Force core packages to one copy.
config.resolver.extraNodeModules = {
  react: path.resolve(workspaceRoot, "node_modules/react"),
  "react-native": path.resolve(workspaceRoot, "node_modules/react-native"),
  "react/jsx-runtime": path.resolve(
    workspaceRoot,
    "node_modules/react/jsx-runtime",
  ),
};

module.exports = withNativeWind(config, { input: "./global.css" });
