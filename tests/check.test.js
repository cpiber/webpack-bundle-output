const { webpack, file } = require('./shared');
const { getFixturePathSync } = require('jest-fixtures');

test('single file', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'basic'),
  });
  expect(file(map)).toMatchSnapshot();
});

test('includes', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'includes'),
  });
  expect(file(map)).toMatchSnapshot();
});

test('import', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'import'),
  });
  expect(file(map)).toMatchSnapshot();
});

test('multiple entries basic', async () => {
  const { map } = await webpack({
    entry: {
      basic: getFixturePathSync(__dirname, 'basic'),
      includes: getFixturePathSync(__dirname, 'includes'),
    },
  });
  expect(file(map)).toMatchSnapshot();
});

test('multiple entries cross-files', async () => {
  const { map } = await webpack({
    entry: {
      basic: getFixturePathSync(__dirname, 'basic'),
      includes: getFixturePathSync(__dirname, 'includes'),
      cross: getFixturePathSync(__dirname, 'cross'),
    },
  });
  expect(file(map)).toMatchSnapshot();
});

test('lib', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'lib'),
  });
  expect(file(map)).toMatchSnapshot();
});

test('loader', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'loader'),
  });
  expect(file(map)).toMatchSnapshot();
});

test('ts', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'ts'),
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: "ts-loader", options: { configFile: getFixturePathSync(__dirname, 'ts/tsconfig.json') } },
      ],
    },
  });
  expect(file(map)).toMatchSnapshot();
});

test('ts loader', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'loader-ts'),
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: "ts-loader", options: { configFile: getFixturePathSync(__dirname, 'ts/tsconfig.json') } },
      ],
    },
  });
  expect(file(map)).toMatchSnapshot();
});

test('async', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'async'),
  });
  expect(file(map)).toMatchSnapshot();
});

test('async loader', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'loader-async'),
  });
  expect(file(map)).toMatchSnapshot();
});