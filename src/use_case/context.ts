import { BaseContext } from 'src/base';
import { DtoModelOption, HttpMethods, ResultType, UseCaseType } from './models';
import { CasesNamespace, EntitiesNamespace, RepositoryNamespace, RequestParamsNamespace } from './namespace';

export class UseCaseContext extends BaseContext {
  public static dirname: string;
  public static caseType: UseCaseType;
  public static methodType: HttpMethods = HttpMethods.get;
  public static resultType: ResultType = ResultType.dto;
  public static domainName: string;
  public static sourceName: string;
  public static dtoModel: DtoModelOption;

  public static get caseName() {
    return this.sourceName.toLine();
  }

  public static get requestParams() {
    return new RequestParamsNamespace();
  }
  public static get entities() {
    return new EntitiesNamespace();
  }
  public static get repository() {
    return new RepositoryNamespace();
  }
  public static get cases() {
    return new CasesNamespace();
  }
}
