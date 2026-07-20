const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");
const sharedRoot = path.resolve(monorepoRoot, "packages/shared");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot, sharedRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "@feelgood/shared": sharedRoot,
};

module.exports = config;
