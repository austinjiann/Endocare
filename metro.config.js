const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for mobile loading
config.resolver.platforms = ['ios', 'android', 'native'];

module.exports = config;