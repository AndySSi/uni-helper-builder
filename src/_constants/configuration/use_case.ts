import { UseCaseConfiguration } from 'types';

export const useCaseConfiguration: UseCaseConfiguration = {
  entry: 'index',
  dirname: 'cases',
  fileSuffix: 'use_case',
  aggregateRoot: 'aggregateRoot',
  restful: {
    detail: 'byId',
    paginator: 'paginator',
    created: 'created',
    updated: 'updated',
    deleted: 'deleted',
  },
  models: {
    basic: {
      hookName: 'BaseUseCase',
      override: {
        onRun: 'onRun',
      },
    },
    module: {
      hookName: 'ModuleUseCase',
      override: {
        onRun: 'onRun',
      },
    },
    paginator: {
      hookName: 'PaginatorUseCase',
      override: {
        onRun: 'onRun',
      },
      annotation: {
        pagedResultDto: 'PagedResultDto',
        pagedQueryParams: 'PagedQueryParams',
      },
    },
  },
};
