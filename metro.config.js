const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force metro to resolve react from the project root
config.resolver.extraNodeModules = {
  react: path.resolve(__dirname, 'node_modules/react'),
};

module.exports = config;
