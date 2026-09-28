require('ts-chained-ast/dist/index.es');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const check = require('node:assert/strict');
const ts = require('typescript');
const { BuilderConvert } = require('../src/dto/builders/builder_convert');
const { defaultConfiguration } = require('../src/_constants/configuration');
Object.assign(Context.config, defaultConfiguration, { dependencyName: '@shivip/mp-core' });
function infos(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.dto.ts'))
    .map((name) => ({
      filepath: path.join(dir, name),
      dirname: dir,
      dtoName: fs.readFileSync(path.join(dir, name), 'utf8').match(/export class (\w+)/)[1],
      config: { abstract: false },
      convertInfo: {
        root: dir,
        rootDir: '_converts',
        filename: name.replace('.dto.ts', '_dto_converts'),
        filepath: path.join(dir, '_converts', name.replace('.dto.ts', '_dto_converts.ts')),
      },
    }));
}
async function generate(dir, names) {
  const all = infos(dir);
  const callbacks = await BuilderConvert.build(names ? all.filter((dto) => names.includes(dto.dtoName)) : all, all);
  callbacks.filter(Boolean).forEach((run) => run());
}
async function main() {
  if (process.argv[2] === '--generate-system') {
    await generate(path.resolve(process.argv[3]), ['SystemRequestDomainDto', 'SystemAppSettingDto']);
    return;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'json-encoded-dto-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'item.dto.ts'),
      "import { BaseDto, Default } from '@shivip/mp-core'; export class ItemDto extends BaseDto { @Default('') key: string; }",
    );
    const source =
      "import { BaseDto, Default, OriginalKey, JsonEncoded } from '@shivip/mp-core'; import { ItemDto } from './item.dto'; export class SampleDto extends BaseDto { @OriginalKey('raw') @JsonEncoded() @Default([]) items: ItemDto[]; @Default('') plain: string; }";
    fs.writeFileSync(path.join(dir, 'sample.dto.ts'), source);
    await generate(dir);
    const stripped = require('@babel/core').transformSync(source, {
      configFile: false,
      babelrc: false,
      parserOpts: { plugins: ['typescript', 'decorators-legacy'] },
      plugins: [require('../omit_dto_decorators.cjs')],
    }).code;
    check.doesNotMatch(stripped, /@JsonEncoded/);
    const file = path.join(dir, '_converts/sample_dto_converts.ts');
    const first = fs.readFileSync(file, 'utf8');
    check.match(first, /decodeJsonField/);
    check.match(first, /SampleDto.items/);
    check.match(first, /ItemDto.fromJson/);
    const dtoFirst = fs.readFileSync(path.join(dir, 'sample.dto.ts'), 'utf8');
    await generate(dir);
    check.equal(fs.readFileSync(file, 'utf8'), first);
    check.equal(fs.readFileSync(path.join(dir, 'sample.dto.ts'), 'utf8'), dtoFirst);
    const mod = { exports: {} };
    let calls = 0;
    class SampleDto {}
    const runtime = {
      decodeJsonField(input) {
        calls++;
        return typeof input === 'string' ? JSON.parse(input) : input;
      },
    };
    const dependencies = (name) =>
      name === '@shivip/mp-core'
        ? runtime
        : name.includes('sample.dto')
          ? { SampleDto }
          : {
              ItemDto: {
                fromJson(value) {
                  return { ...value, converted: true };
                },
              },
            };
    new Function(
      'require',
      'exports',
      'module',
      ts.transpileModule(first, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    )(dependencies, mod.exports, mod);
    const convert = mod.exports._$SampleDtoFromJson();
    check.deepEqual(convert({ raw: '[{"key":"中文"}]', plain: 'unchanged' }).items, [{ key: '中文', converted: true }]);
    check.equal(calls, 1);
    check.equal(convert({ plain: 'unchanged' }).plain, 'unchanged');
    check.deepEqual(convert({ raw: [] }).items, []);
    for (const value of [null, 1, 'text', []]) check.throws(() => convert({ raw: [value] }), /SampleDto.items\[0\]/);
    for (const field of [
      '@JsonEncoded() @Default([]) items: string[];',
      '@JsonEncoded() @Default([]) items?: ItemDto[];',
      '@JsonEncoded() @Required() @Default([]) items: ItemDto[];',
    ]) {
      fs.writeFileSync(
        path.join(dir, 'sample.dto.ts'),
        source.replace("@OriginalKey('raw') @JsonEncoded() @Default([]) items: ItemDto[];", field),
      );
      await check.rejects(() => generate(dir), /JsonEncoded requires/);
    }
    Context.config.entities.dto.decorators.jsonEncoded = 'EncodedJson';
    Context.config.dependencies.decodeJsonField.hookName = 'decodeCustom';
    fs.writeFileSync(
      path.join(dir, 'sample.dto.ts'),
      source.replace('@JsonEncoded()', '@EncodedJson()').replace('items: ItemDto[]', 'items: Array<ItemDto>'),
    );
    await generate(dir);
    check.match(fs.readFileSync(file, 'utf8'), /decodeCustom/);
    console.log(
      'PASS generator: decoding, child conversion, field errors, unchanged fields, invalid declarations, repeat generation',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
