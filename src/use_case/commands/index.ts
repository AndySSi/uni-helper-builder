// import ts from 'typescript';

import { HttpMethods, ResultType, UseCaseType } from '../models';
import { DDD_NAME_REGEX /* ORIGINAL_KEYS, configContext */ } from 'src/_constants';
import { BaseBuildCommand } from 'src/base';
import { UseCaseContext } from '../context';

export class UseCaseBuildCommand extends BaseBuildCommand {
  public selection: string[];

  constructor(public dirname: string) {
    super();
    UseCaseContext.dirname = dirname;
  }

  async getDomainName() {
    const children = this.dirname.dirChildren({ mode: 0 });

    if (!children.length) {
      this.dirname.padSuffix('当前目录为空').printError(true);
    }

    const item = await Interactive.select(children, false);

    UseCaseContext.domainName = children[item];
  }

  async getSourceName() {
    const name = await Interactive.of('Please enter a use case name');

    if (!DDD_NAME_REGEX.test(name)) {
      `invalid name ${name}`.printError(true);
    }

    UseCaseContext.sourceName = name;
  }

  async getCaseType() {
    UseCaseContext.caseType = await Interactive.of([
      { name: UseCaseType[UseCaseType.basic].padSuffix(':基本用例类型'), value: UseCaseType.basic },
      { name: UseCaseType[UseCaseType.module].padSuffix(':模块用例类型'), value: UseCaseType.module },
      { name: UseCaseType[UseCaseType.paginator].padSuffix(':分页用例类型'), value: UseCaseType.paginator },
    ]);
  }

  async getMethodType() {
    let type = HttpMethods.get;

    if (![UseCaseType.paginator, UseCaseType.module].includes(UseCaseContext.caseType)) {
      type = await Interactive.of(HttpMethods);
    }

    UseCaseContext.methodType = type;
  }

  async getResultType() {
    if (UseCaseContext.methodType !== HttpMethods.get) {
      UseCaseContext.resultType = await Interactive.of(ResultType);
    }
  }
}
