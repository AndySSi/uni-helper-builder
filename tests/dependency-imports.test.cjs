const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');
const babel = createRequire(require.resolve('@babel/core'));
const parser = babel('@babel/parser');
const generate = babel('@babel/generator').default;
const source = fs.readFileSync(path.resolve(__dirname, '../src/use_case/builders/merge_dependency_imports.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function('require', 'exports', 'module', output)(babel, mod.exports, mod);
const merge = mod.exports.mergeDependencyImports;
const parse = code => parser.parse(code, { sourceType: 'module', plugins: ['typescript'] });
const runtime = ['BaseRepository', 'HttpRequestMethod'];
for (const prefix of [
  "import type { PagedResultDto } from 'core'; import { BaseRepository, HttpRequestMethod } from 'core';",
  "import { BaseRepository } from 'core'; import type { PagedResultDto } from 'core'; import { HttpRequestMethod } from 'core';",
  "import type { PagedResultDto, BaseRepository } from 'core';",
  "import { type BaseRepository, type PagedResultDto } from 'core';",
  "import * as Core from 'core';", '',
]) {
  test(`unique bindings and repeat generation: ${prefix || 'no imports'}`, () => {
    const ast = parse(prefix);
    merge(ast, 'core', runtime, ['PagedResultDto']);
    const once = generate(ast).code;
    merge(ast, 'core', runtime, ['PagedResultDto']);
    assert.equal(generate(ast).code, once);
    parse(once);
    for (const name of [...runtime, 'PagedResultDto']) {
      const matches = ast.program.body.flatMap(node => (node.specifiers || []).filter(s => s.local.name === name).map(s => [node, s]));
      assert.equal(matches.length, 1, name);
      if (runtime.includes(name)) {
        assert.notEqual(matches[0][0].importKind, 'type');
        assert.notEqual(matches[0][1].importKind, 'type');
      }
    }
    if (prefix.startsWith('import type { PagedResultDto }')) {
      assert.equal(ast.program.body[0].importKind, 'type');
      assert.deepEqual(ast.program.body[0].specifiers.map(s => s.local.name), ['PagedResultDto']);
    }
  });
}
test('conflicting local alias reports a clear error', () => {
  assert.throws(() => merge(parse("import { Other as BaseRepository } from 'core';"), 'core', runtime), /already bound to another export/);
});

test('different dependency source is rejected before adding duplicate bindings', () => {
  const ast = parse("import { BaseRepository } from 'legacy-core';");
  const before = generate(ast).code;
  assert.throws(() => merge(ast, 'core', runtime), /Dependency configuration mismatch.*legacy-core.*code-build.config.ts/);
  assert.equal(generate(ast).code, before);
});
