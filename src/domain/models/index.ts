import { DtoModelOption, HttpMethods, ResultType, UseCaseType } from 'src/use_case/models';

export enum DomainRunnerType {
  create,
  delete,
  // stats,
}

export enum DomainCreateTemplate {
  empty,
}

export type DomainCreateConfig = {
  domains: Array<DomainConfigModel>;
};

export interface DomainConfigModel {
  name: string;
  type: keyof typeof DomainCreateTemplate;
  cases: Array<DomainConfigCaseModel>;
  dtos: Record<string, DtoModelOption>;
}

export interface DomainConfigCaseModel {
  name: string;
  methodType: keyof typeof HttpMethods;
  type: keyof typeof UseCaseType;
  resultType: keyof typeof ResultType;
  dtoModel: DtoModelOption;
}
