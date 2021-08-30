const BundleOutputPlugin = require('../BundleOutputPlugin');
const { webpack } = require('webpack');
const { join } = require('path');
const { readFileSync } = require('fs');
const { createHash } = require('crypto');

/**
 * Produce a unique output path based on options and a path to the expected map
 * @param {import('webpack').Configuration} options
 * @param {Record<string, any>} pluginOpt
 */
module.exports.toMap = (options, pluginOpt = {}) => {
  const hash = createHash('md5')
    .update(JSON.stringify(options))
    .update(JSON.stringify(pluginOpt))
    .digest('hex');
  const out = join(__dirname, 'out', hash);
  return { out, map: join(out, typeof pluginOpt.output === 'string' ? pluginOpt.output : 'map.json') };
};

/**
 * Produce the webpack options object
 * @param {import('webpack').Configuration} options
 * @param {string} out path
 * @param {Record<string, any>} pluginOpt
 */
module.exports.webpackOptions = (options, out, pluginOpt = {}) => ({
  mode: 'development',
  devtool: 'source-map',
  ...options,
  plugins: [
    ...(options.plugins || []),
    new BundleOutputPlugin(pluginOpt),
  ],
  output: {
    ...(options.output || {}),
    path: out,
  },
});

/**
 * Promisify webpack build
 * @param {import('webpack').Configuration} options
 * @param {Record<string, any>} pluginOpt
 * @returns {Promise<{ errror: Error, stats: import('webpack').Stats, out: string, map: string }>}
 */
module.exports.webpack = (options, pluginOpt = {}) => new Promise(resolve => {
  const { out, map } = this.toMap(options, pluginOpt);
  webpack(this.webpackOptions(options, out, pluginOpt), (err, stats) => {
    if (err) console.error(err);
    resolve({ err, stats, out, map });
  });
});

/**
 * sync read JSON file
 * @param {string} file
 */
module.exports.file = file => JSON.parse(readFileSync(file).toString('utf-8'));