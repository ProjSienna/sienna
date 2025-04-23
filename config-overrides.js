const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Add resolve fallbacks
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    util: require.resolve('util/'),
    url: require.resolve('url/'),
    assert: require.resolve('assert/'),
    fs: false,
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
  };

  // Fix module resolution for .js files in node_modules
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  
  // Add rules to handle process/browser with .js extension
  config.module.rules.push({
    test: /\.m?js$/,
    include: /node_modules/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Add custom alias for process/browser
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser'),
  };

  // Exclude problematic packages
  config.externals = {
    ...config.externals,
    '@walletconnect/solana-adapter': 'commonjs @walletconnect/solana-adapter',
    '@solana/wallet-adapter-walletconnect': 'commonjs @solana/wallet-adapter-walletconnect',
  };

  // Add plugins
  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new webpack.NormalModuleReplacementPlugin(
      /node:process/,
      (resource) => {
        resource.request = 'process/browser';
      }
    ),
    new webpack.NormalModuleReplacementPlugin(
      /process\/browser/,
      (resource) => {
        // Only replace if it's not already pointing to process/browser.js
        if (!resource.request.endsWith('.js')) {
          resource.request = 'process/browser.js';
        }
      }
    ),
    new webpack.IgnorePlugin({
      resourceRegExp: /^@walletconnect\/solana-adapter$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^@solana\/wallet-adapter-walletconnect$/,
    }),
  ];

  // Ignoring source map warnings
  config.ignoreWarnings = [
    function ignoreSourcemapsloaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource.includes('node_modules') &&
        warning.details &&
        warning.details.includes('source-map-loader')
      );
    },
  ];

  return config;
};
