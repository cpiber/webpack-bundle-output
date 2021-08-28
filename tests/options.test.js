const { webpack, file } = require('./shared');
const { getFixturePathSync } = require('jest-fixtures');
const { existsSync } = require('fs');
const { join } = require('path');

test('obeys output', async () => {
  const { out } = await webpack({
    entry: getFixturePathSync(__dirname, 'basic'),
  }, { output: 'test.json' });
  expect(existsSync(join(out, 'test.json'))).toBeTruthy();
});

test('obeys cwd', async () => {
  const { map } = await webpack({
    entry: getFixturePathSync(__dirname, 'basic'),
  }, { cwd: getFixturePathSync(__dirname) });
  expect(file(map)).toMatchSnapshot();
});