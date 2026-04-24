const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [
    // Add the workspace root to watch for changes in the core library
    path.resolve(__dirname, '../../'),
  ],
  resolver: {
    unstable_enableSymlinks: true,
    // Node modules to exclude from bundling
    nodeModulesPaths: [
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
