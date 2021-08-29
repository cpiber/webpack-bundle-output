const { webpack } = require('webpack');
const { toMap, file, webpackOptions } = require('./shared');
const { getFixturePathSync } = require('jest-fixtures');
const { copyFileSync } = require('fs');
const { join } = require('path');

test('watch correctly adds and removes sources', async () => {
  // use a mock to be able to easily exchange callbacks
  const cb = jest.fn();
  const options = {
    entry: getFixturePathSync(__dirname, 'watch'),
  };
  const { out, map } = toMap(options);
  const index = join(options.entry, 'index.js');

  /** @type {import('webpack').Watching} */
  let watcher;
  await new Promise(resolve => {
    // prepare first pass
    cb.mockImplementation(resolve);
    copyFileSync(getFixturePathSync(__dirname, 'watch', 'pass1.js'), index);
    // and start watching
    watcher = webpack(webpackOptions(options, out)).watch({}, cb);
  });
  expect(file(map)).toMatchSnapshot();
  expect(cb).toHaveBeenCalledTimes(1);

  await new Promise(resolve => {
    // prepare second pass
    cb.mockImplementation(resolve);
    copyFileSync(getFixturePathSync(__dirname, 'watch', 'pass2.js'), index);
  });
  expect(file(map)).toMatchSnapshot();
  expect(cb).toHaveBeenCalledTimes(2);

  await new Promise(resolve => {
    // prepare third pass
    cb.mockImplementation(resolve);
    copyFileSync(getFixturePathSync(__dirname, 'watch', 'pass3.js'), index);
  });
  expect(file(map)).toMatchSnapshot();
  expect(cb).toHaveBeenCalledTimes(3);

  await new Promise(resolve => watcher.close(resolve));
});