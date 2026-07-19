import { ORIGINAL_KEYS } from 'src/_constants';
import { UseCaseType } from '../models';
import { UseCaseContext } from '../context';

export class CasesNamespace {
  public rootPath: string;
  private suffix: string;
  private combineName: string[];

  constructor() {
    this.rootPath = [UseCaseContext.dirname, UseCaseContext.domainName, Context.config.useCase.dirname].toPath;
    this.suffix = {
      [UseCaseType.basic]: Context.config.useCase.models.basic.hookName.replace('Base', ''),
      [UseCaseType.module]: Context.config.useCase.models.module.hookName,
      [UseCaseType.paginator]: Context.config.useCase.models.paginator.hookName,
    }[UseCaseContext.caseType];
    this.combineName = [UseCaseContext.domainName, ...UseCaseContext.caseName.split('_'), ...this.suffix.firstToLower.toLine().split('_')];
  }

  public get casesName() {
    return this.combineName.toHump();
  }

  public get filename() {
    return this.combineName.toLine();
  }

  public get filepath() {
    return [this.rootPath, this.filename.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;
  }
}
