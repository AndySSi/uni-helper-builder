import { ORIGINAL_KEYS } from 'src/_constants';
import { HttpMethods } from '../models';
import { UseCaseContext } from '../context';

export class RequestParamsNamespace {
  private suffix: string[];
  private combineName: string[];
  public rootPath: string;

  constructor() {
    this.suffix = [
      UseCaseContext.methodType === HttpMethods.get ? Context.config.repository.httpApi.properties.query : Context.config.repository.httpApi.properties.body,
      Context.config.repository.httpApi.params,
    ];
    this.combineName = [UseCaseContext.domainName, ...UseCaseContext.caseName.split('_'), ...this.suffix];
    this.rootPath = [UseCaseContext.dirname, UseCaseContext.domainName, Context.config.requestParams.dirname].toPath;
  }

  public get annotationName() {
    return this.combineName.toHump();
  }

  public get filename() {
    return this.combineName.toLine();
  }

  public get filepath() {
    return [this.rootPath, this.filename.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;
  }
}
