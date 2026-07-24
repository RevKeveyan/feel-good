const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, "../../packages/shared");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sharedRoot];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "@feelgood/shared": sharedRoot,
};

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
