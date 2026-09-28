const path = require('node:path');
const { spawnSync } = require('node:child_process');
const webpack = require('webpack');
const config = require('../webpack.config.cjs');
webpack(
  {
    ...config,
    context: path.resolve(__dirname, '..'),
    entry: './tests/json-encoded.entry.cjs',
    output: { path: path.resolve(__dirname, '../dist'), filename: 'json-encoded.test.cjs' },
  },
  (err, stats) => {
    if (err || stats.hasErrors()) {
      console.error(err || stats.toString({ all: false, errors: true }));
      process.exitCode = 1;
      return;
    }
    const result = spawnSync(
      process.execPath,
      [path.resolve(__dirname, '../dist/json-encoded.test.cjs'), ...process.argv.slice(2)],
      { stdio: 'inherit' },
    );
    process.exitCode = result.status ?? 1;
  },
);
