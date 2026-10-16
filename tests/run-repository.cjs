const path = require('node:path');
const { spawnSync } = require('node:child_process');
const webpack = require('webpack');
const config = require('../webpack.config.cjs');
// Run from the consuming project so Context.init reads its code-build.config.ts.
webpack({ ...config, context: path.resolve(__dirname, '..'), entry: './tests/repository-generation.entry.cjs', output: { path: path.resolve(__dirname, '../dist'), filename: 'repository-generation.test.cjs' } }, (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }));
    process.exitCode = 1;
    return;
  }
  const result = spawnSync(process.execPath, [path.resolve(__dirname, '../dist/repository-generation.test.cjs')], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
});
