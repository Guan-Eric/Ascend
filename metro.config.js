const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const uniwindConfig = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind-types.d.ts",
  // Wave A: light canvas default + optional dark. Extra themes retired.
  adaptiveThemes: false,
});

uniwindConfig.resolver.extraNodeModules = {
  ...uniwindConfig.resolver.extraNodeModules,
  punycode: require.resolve("punycode"),
};

module.exports = uniwindConfig;
