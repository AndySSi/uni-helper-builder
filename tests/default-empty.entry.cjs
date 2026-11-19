require('ts-chained-ast/dist/index.es');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const check = require('node:assert/strict');
const ts = require('typescript');
const { getBuildInfo } = require('../src/dto/builders/builder_convert/utils/build_info');
const { getValueExpression } = require('../src/dto/builders/builder_convert/utils/build_value_expression');
const { defaultConfiguration } = require('../src/_constants/configuration');
Object.assign(Context.config, defaultConfiguration, { dependencyName: '@shivip/mp-core' });
const printer = ts.createPrinter();
const sourceFile = ts.createSourceFile('output.ts', '', ts.ScriptTarget.Latest);
function expressions(file) {
  const fields = [];
  getBuildInfo({ filepath: file, dtoName: 'SampleDto', config: { abstract: false } }, [], fields, []);
  return Object.fromEntries(fields.map(prop => [prop.field,
    printer.printNode(ts.EmitHint.Expression, getValueExpression(prop, 'SampleDto').node, sourceFile)]));
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'default-empty-'));
const file = path.join(dir, 'sample.dto.ts');
function compileFields(fields) {
  fs.writeFileSync(file, `export class SampleDto { ${fields} }`);
  return expressions(file);
}
try {
  const output = compileFields(`
    @OriginalKey('raw') @Default('fallback', { useDefaultWhenEmpty: true }) text: string;
    @Default('fallback') legacy: string;
    @Default('fallback', { useDefaultWhenEmpty: false }) disabled: string;
    @Default(99) count: number;
    @Default(true) flag: boolean;
    @Default('fallback', { useDefaultWhenEmpty: true }) nullable: string | null | undefined;
  `);
  const run = (key, input) => new Function('json', `return (${output[key]});`)(input);
  for (const value of [undefined, null, '', '  ', '\t\n', '\u3000']) {
    check.equal(run('text', { raw: value }), 'fallback');
    check.equal(run('nullable', { nullable: value }), 'fallback');
  }
  for (const value of ['小说', '  保留空格  ', '0', 0, false]) check.equal(run('text', { raw: value }), value);
  check.equal(run('text', {}), 'fallback');
  for (const key of ['legacy', 'disabled']) {
    for (const value of ['', '  ', 0, false]) check.equal(run(key, { [key]: value }), value);
    for (const value of [null, undefined]) check.equal(run(key, { [key]: value }), 'fallback');
    check.match(output[key], /\?\?/);
  }
  check.equal(run('count', { count: 0 }), 0);
  check.equal(run('flag', { flag: false }), false);
  for (const field of [
    "@Default('', { typo: true }) text: string;",
    "@Default('', { useDefaultWhenEmpty: 'true' }) text: string;",
    "@Default('', options) text: string;",
    "@Default('', { ...options }) text: string;",
    "@Default(0, { useDefaultWhenEmpty: true }) text: number;",
    "@Default('', { useDefaultWhenEmpty: true }) text: string | number;",
    "@Required() @Default('', { useDefaultWhenEmpty: true }) text: string;",
    "@Default('', { useDefaultWhenEmpty: true }) @WhenMap('raw') text: string;",
  ]) check.throws(() => compileFields(field), /@Default options|useDefaultWhenEmpty/);
  const dtoFile = path.resolve('src/applications/domains/novel/entities/novel_search.dto.ts');
  const actual = expressions(dtoFile);
  const expected = { name: ['book_name', '暂无书名'], author: ['author', '佚名'],
    aboutAuthor: ['author_message', '作者很低调，啥也没留下'], describe: ['introduce', '作者还在偷懒，本书介绍还在构思中...'],
    category: ['class_name', '暂无分类'] };
  for (const [key, [raw, fallback]] of Object.entries(expected)) {
    const convert = new Function('json', `return (${actual[key]});`);
    for (const value of [null, undefined, '', '\t ']) check.equal(convert({ [raw]: value }), fallback);
    check.equal(convert({ [raw]: '  原文  ' }), '  原文  ');
  }
  if (process.argv.includes('--generate')) {
    const converted = path.resolve('src/applications/domains/novel/entities/_converts/novel_search_dto_converts.ts');
    let content = fs.readFileSync(converted, 'utf8');
    for (const key of Object.keys(expected)) {
      content = content.replace(new RegExp(`  dto\\.${key} = [^;]+;`), `  dto.${key} = ${actual[key]};`);
    }
    fs.writeFileSync(converted, content);
  }
  const converted = path.resolve('src/applications/domains/novel/entities/_converts/novel_search_dto_converts.ts');
  const moduleResult = { exports: {} };
  class NovelSearchDto {}
  const enumStub = { find: value => value };
  const dependency = name => name === '@shivip/mp-core' ? { assert() {} }
    : name.includes('novel_search.dto') ? { NovelSearchDto }
    : { BookSourceType: enumStub, BookChannel: enumStub, BookUpdateStatus: enumStub };
  new Function('require', 'module', 'exports', ts.transpileModule(fs.readFileSync(converted, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText)(dependency, moduleResult, moduleResult.exports);
  const fromJson = moduleResult.exports._$NovelSearchDtoFromJson();
  for (const value of [undefined, null, '', ' \n', '正文']) {
    const raw = Object.fromEntries(Object.values(expected).map(([key]) => [key, value]));
    const dto = fromJson({ id: 1, ...raw, score: 0, categoryId: 0 });
    for (const [key, [, fallback]] of Object.entries(expected)) check.equal(dto[key], value === '正文' ? value : fallback);
    check.equal(dto.score, 0);
    check.equal(dto.categoryId, 0);
    check.equal(Object.isFrozen(dto), true);
    check.equal(moduleResult.exports._$NovelSearchDtoToList([{ id: 1, ...raw }])[0].name, dto.name);
  }
  check.deepEqual(expressions(dtoFile), actual);
  console.log('PASS: Default opt-in, legacy defaults, invalid options/types, actual novel fields and generation');
} finally {
  const resolved = path.resolve(dir);
  check.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
  check.ok(path.basename(resolved).startsWith('default-empty-'));
  fs.rmSync(resolved, { recursive: true, force: true });
}
