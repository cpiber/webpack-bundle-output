# BundleOutputPlugin

BundleOutputPlugin is a webpack plugin for producing "inverse source-maps".

This plugin produces a `map.json` that maps each source file to all the build files it is included in (key source file to build file array).

It was created for [this issue](https://github.com/wp-cli/i18n-command/issues/282) to implement translating source files for WordPress plugins+themes.


## Installation

`npm install --save-dev webpack-bundle-output`


## Usage

Simply include BundleOutputPlugin in the plugins array of your `webpack.config.js`:

```js
const BundleOutputPlugin = require('webpack-bundle-output');

module.exports = {
  ...,
  plugins: [new BundleOutputPlugin()],
  ...,
}
```

## Options

The plugin supports two options (`new BundleOutputPlugin({ ... })`):

- `cwd` (string). The working directory, relative to which the map should be. Influences both source and build path. Default: `process.cwd()`
- `output` (string). The output name/path of the map file in the build directory. Default: `map.json`.