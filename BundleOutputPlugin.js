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
  /**
   * @type {{[key:string]: Set<string>}}
   */
  files = {};
  outpath = '';
  NormalModule = null;

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
    this.NormalModule = NormalModule;

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      this.files = {};
      this.outpath = compilation.outputOptions.path;

      compilation.hooks.processAssets.tap({
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      }, () => {
        compilation.chunks.forEach(chunk =>
          compilation.chunkGraph.getChunkModules(chunk).forEach(module => this.handleModule(chunk, module)));

        for (const f in this.files)
          this.files[f] = [...this.files[f].values()];
        
        compilation.emitAsset(this.options.output, new RawSource(JSON.stringify(this.files)));
      });
    });
  }

  /**
   * @param {import('webpack').Chunk} chunk
   * @param {import('webpack').Module} module
   */
  handleModule(chunk, module) {
    if (module instanceof this.NormalModule)
      this.addResource(chunk, module.resource);
    else if (module.rootModule)
      this.handleModule(chunk, module.rootModule);
  }

  /**
   * @param {import('webpack').Chunk} chunk
   * @param {string} resource
   */
  addResource(chunk, resource) {
    const file = relative(this.options.cwd, resource);
    const set = this.files[file] = this.files[file] || new Set();
    chunk.files.forEach(f => set.add(relative(this.options.cwd, join(this.outpath, f))));
  }
}
module.exports = BundleOutputPlugin;