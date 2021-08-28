const BundleOutputPlugin = require('./BundleOutputPlugin');

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: 'development',
  entry: {
    shared: ['jquery'],
    index: {
      import: './src/index.js',
      filename: 'test/index.js',
      dependOn: 'shared',
    },
    other: './src/other.js'
  },
  output: {
    clean: true,
    chunkFilename: '[name].chunk.js',
    filename: '[name].file.js',
  },
  devtool: 'source-map',
  plugins: [new BundleOutputPlugin()],
};