const { relative, join } = require('path');
const { validate } = require('schema-utils');
const { cwd } = process;

// schema for options object
const schema = {
  type: 'object',
  properties: {
    cwd: {
      type: 'string',
    },
    output: {
      type: 'string',
    },
  },
};

class BundleOutputPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: BundleOutputPlugin.name,
      baseDataPath: "options",
    });
    this.options = { cwd: cwd(), output: 'map.json', ...options };
  }

  /**
   * @param {import('webpack').Compiler} compiler 
   */
  apply(compiler) {
    const pluginName = BundleOutputPlugin.name;
    const { webpack } = compiler;
    const { Compilation, NormalModule } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      /**
       * @type {{[key:string]: Set<string>}}
       */
      const files = {};

      compilation.hooks.processAssets.tap({
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      }, () => {

        compilation.chunks.forEach(chunk => {
          for (const module of compilation.chunkGraph.getChunkModules(chunk)) {
            if (!(module instanceof NormalModule)) return;
            const file = relative(this.options.cwd, module.resource);
            const set = files[file] = files[file] || new Set();
            chunk.files.forEach(f => set.add(relative(this.options.cwd, join(compilation.outputOptions.path, f))));
          }
        });

        for (const f in files) {
          files[f] = [...files[f].values()];
        }

        compilation.emitAsset(this.options.output, new RawSource(JSON.stringify(files)));
      });
    });
  }
}
module.exports = BundleOutputPlugin;