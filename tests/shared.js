const BundleOutputPlugin = require('../BundleOutputPlugin');
const { webpack } = require('webpack');
const { join } = require('path');
const { readFileSync } = require('fs');
const { createHash } = require('crypto');

/**
 * @param {import('webpack').Configuration} options
 * @param {Record<string, any>} pluginOpt
 * @returns {Promise<{ errror: Error, stats: import('webpack').Stats, out: string, map: string }>}
 */
module.exports.webpack = (options, pluginOpt = {}) => new Promise(resolve => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(options));
  const out = join(__dirname, 'out', hash.digest('hex'));
  webpack({
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
  }, (err, stats) => {
    if (err) console.error(err);
    resolve({ err, stats, out, map: join(out, 'map.json') })
  });
});

module.exports.file = file => JSON.parse(readFileSync(file).toString('utf-8'));