const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, "../../packages/shared");
const mobileNodeModules = path.resolve(projectRoot, "node_modules");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sharedRoot];

config.resolver.nodeModulesPaths = [mobileNodeModules];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "@feelgood/shared": sharedRoot,
  "@babel/runtime": path.resolve(mobileNodeModules, "@babel/runtime"),
};

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
