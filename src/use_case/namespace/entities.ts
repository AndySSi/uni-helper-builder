import { ORIGINAL_KEYS, getDtoNamespace } from 'src/_constants';
import { UseCaseContext } from '../context';

export class EntitiesNamespace {
  public rootPath: string;

  constructor() {
    this.rootPath = [UseCaseContext.dirname, UseCaseContext.domainName, Context.config.entities.dirname].toPath;
  }

  public get entityName() {
    return getDtoNamespace([UseCaseContext.domainName, ...UseCaseContext.caseName.split('_')].toHump());
  }

  public get filename() {
    return [UseCaseContext.domainName, UseCaseContext.caseName.toLine().padSuffix(Context.config.entities.dto.fileSuffix)].toLine();
  }

  public get filepath() {
    return [this.rootPath, this.filename.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;
  }
}
