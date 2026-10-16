require('ts-chained-ast/dist/index.es');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { defaultConfiguration } = require('../src/_constants/configuration');
const { UseCaseContext } = require('../src/use_case/context');
const { HttpMethods, UseCaseType, ResultType } = require('../src/use_case/models');
const { buildRepository } = require('../src/use_case/builders/build_repository');
async function main() {
  Context.setEntry('code-build');
  await Context.init(defaultConfiguration);
  assert.equal(Context.config.dependencyName, '@shivip/mp-core', 'project configuration must override the package default');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repository-generation-'));
  fs.mkdirSync(path.join(dir, 'user'));
  const file = path.join(dir, 'user/repository.ts');
  fs.writeFileSync(file, "import type { PagedResultDto } from '@shivip/mp-core';\nimport { BaseRepository, HttpRequestMethod } from '@shivip/mp-core';\nclass UserRepository extends BaseRepository {}\n");
  Object.assign(UseCaseContext, {dirname: dir, domainName:'user', sourceName:'wxoaJssdkConfig', caseType:UseCaseType.basic, methodType:HttpMethods.get, resultType:ResultType.dto});
  const write = await buildRepository();
  assert.equal(typeof write, 'function', 'repository generation must not swallow an error');
  write();
  for (let i=0;i<60;i++) {
    await new Promise(resolve => setTimeout(resolve,50));
    if (fs.readFileSync(file,'utf8').includes('async wxoaJssdkConfig')) break;
  }
  const code=fs.readFileSync(file,'utf8');
  assert.match(code,/async wxoaJssdkConfig/);
  assert.doesNotMatch(code,/@shivip\/qa-core/);
  assert.equal((code.match(/import \{ BaseRepository/g)||[]).length,1);
  console.log('PASS: real Context.init + buildRepository GET/basic with split imports and project configuration');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
