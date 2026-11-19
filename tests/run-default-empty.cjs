const path = require('node:path');
const webpack = require('webpack');
const config = require('../webpack.config.cjs');
webpack({ ...config, context: path.resolve(__dirname, '..'), entry: './tests/default-empty.entry.cjs',
  output: { path: path.resolve(__dirname, '../dist'), filename: 'default-empty.test.cjs' } }, (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }));
    process.exitCode = 1;
    return;
  }
  require('../dist/default-empty.test.cjs');
});
