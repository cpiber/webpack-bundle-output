const { relative, join } = require('path');
const { validate } = require('schema-utils');
const { cwd } = require('process');

const schema = {
    type: 'object',
    properties: {
        output: { type: 'string' },
    },
    additionalProperties: false,
};

class BundleOutputPlugin
{
    constructor(options = {})
    {
        validate(schema, options, {
            name: BundleOutputPlugin.name,
            baseDataPath: 'options',
        });

        this.options = {
            output: 'map.json', // Default output file
            ...options,
        };
    }
    /**
     * @param {import('webpack').Compiler} compiler 
     */
    apply(compiler)
    {
        const pluginName = 'BundleOutputPlugin';
        const { webpack } = compiler;
        const { Compilation, NormalModule } = webpack;
        const { RawSource } = webpack.sources;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) =>
        {
            let filesMap = {}; // Store source-to-output mapping
            const outputPath = compilation.outputOptions.path;

            /**
             * Adds a mapping from source file to output file.
             */
            const addMapping = (sourcePath, outputFile) =>
            {
                if (!sourcePath) return;
                const relativeSource = relative(cwd(), sourcePath);
                filesMap[relativeSource] = filesMap[relativeSource] || new Set();
                filesMap[relativeSource].add(relative(cwd(), join(outputPath, outputFile)));
            };

            /**
             * Recursively processes modules in a chunk.
             */
            const processModule = (chunk, module) =>
            {
                if (module instanceof NormalModule && module.resource) {
                    chunk.files.forEach((outputFile) => addMapping(module.resource, outputFile));
                }

                // Ensure dependencies of entry points are also mapped
                if (module.modules) {
                    module.modules.forEach((subModule) => processModule(chunk, subModule));
                }
            };

            compilation.hooks.processAssets.tap(
                {
                    name: pluginName,
                    stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                () => {
                    compilation.chunks.forEach((chunk) =>
                    {
                        compilation.chunkGraph.getChunkModules(chunk).forEach((module) => processModule(chunk, module));
                    });

                    // Convert Set to array for JSON output
                    const finalMap = Object.fromEntries(
                        Object.entries(filesMap).map(([key, value]) => [key, [...value]])
                    );

                    compilation.emitAsset(this.options.output, new RawSource(JSON.stringify(finalMap, null, 2)));
                }
            );
        });
    }
}

module.exports = BundleOutputPlugin;
