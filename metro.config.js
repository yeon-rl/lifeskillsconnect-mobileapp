const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get default Expo config
const defaultConfig = getDefaultConfig(__dirname);

// Explicitly copy all sections to avoid Metro warning
const config = {
  ...defaultConfig,
  transformer: { ...defaultConfig.transformer },
  resolver: { ...defaultConfig.resolver },
  serializer: { ...defaultConfig.serializer },
  server: { ...defaultConfig.server },
  watchFolders: [...defaultConfig.watchFolders],
};

// Apply NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });
