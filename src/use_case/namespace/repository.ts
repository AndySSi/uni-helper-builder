import { ORIGINAL_KEYS, getRepositoryNamespace } from 'src/_constants';
import { UseCaseContext } from '../context';

export class RepositoryNamespace {
  public rootPath: string;

  constructor() {
    this.rootPath = [UseCaseContext.dirname, UseCaseContext.domainName, Context.config.repository.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;
  }

  public get repositoryName() {
    if (Context.config.repository.enableSingleton === true) {
      return getRepositoryNamespace(UseCaseContext.domainName);
    }
    return getRepositoryNamespace(UseCaseContext.domainName.firstToUpper);
  }
}
