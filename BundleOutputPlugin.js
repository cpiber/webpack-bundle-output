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
      const outpath = compilation.outputOptions.path;

      /**
       * @param {import('webpack').Chunk} chunk
       * @param {import('webpack').Module} module
       */
      const handleModule = (chunk, module) => {
        if (module instanceof NormalModule)
          addResource(chunk, module.resource);
        else if (module.rootModule)
          handleModule(chunk, module.rootModule);
      }

      /**
       * @param {import('webpack').Chunk} chunk
       * @param {string} resource
       */
      const addResource = (chunk, resource) => {
        const file = relative(this.options.cwd, resource);
        const set = files[file] = files[file] || new Set();
        chunk.files.forEach(f => set.add(relative(this.options.cwd, join(outpath, f))));
      }

      compilation.hooks.processAssets.tap({
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      }, () => {
        compilation.chunks.forEach(chunk =>
          compilation.chunkGraph.getChunkModules(chunk).forEach(module => handleModule(chunk, module)));

        for (const f in files)
          files[f] = [...files[f].values()];
        
        compilation.emitAsset(this.options.output, new RawSource(JSON.stringify(files)));
      });
    });
  }
}
module.exports = BundleOutputPlugin;