import { CasesNamespace, EntitiesNamespace, RepositoryNamespace, RequestParamsNamespace } from '../namespace';

export enum HttpMethods {
  get,
  post,
  put,
  delete,
}

export enum UseCaseType {
  basic,
  module,
  paginator,
}

export enum CommandUseCaseType {
  create,
  delete,
  // update
}

export enum ResultType {
  void,
  any,
  dto,
}

export interface UseCaseInfo {
  dirPath: string;
  domainName: string;
  sourceName: string;
  caseName: string;
  caseType: UseCaseType;
  methodType: HttpMethods;
  resultType: ResultType;
  context: {
    requestParams: RequestParamsNamespace;
    entities: EntitiesNamespace;
    repository: RepositoryNamespace;
    cases: CasesNamespace;
  };
}

export type DtoModelOption = {
  [name: string]: {
    required: boolean;
    default: string;
    originalKey: string;
    value: DtoLessModelType | DtoFulModelType;
  };
};

type DtoLessModelType = 'string' | 'number' | 'boolean';

type DtoFulModelType = {
  id: string;
  source?: string;
};
