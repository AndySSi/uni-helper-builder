import { ConfigOption } from 'types';
import { domainConfiguration } from './domain';
import { entitiesConfiguration } from './entities';
import { repositoryConfiguration } from './repository';
import { requestParamsConfiguration } from './request_params';
import { useCaseConfiguration } from './use_case';
import { appsConfiguration } from './apps';

export const defaultConfiguration: ConfigOption = {
  dependencyName: '@shivip/qa-core',
  dependencies: {
    assert: {
      hookName: 'assert',
    },
    createSingleton: {
      hookName: 'createSingleton',
    },
    httpRequestMethod: {
      hookName: 'HttpRequestMethod',
    },
    validArray: {
      hookName: 'validArray',
    },
    validObject: {
      hookName: 'validObject',
    },
    decodeJsonField: {
      hookName: 'decodeJsonField',
    },
  },
  domain: domainConfiguration,
  useCase: useCaseConfiguration,
  entities: entitiesConfiguration,
  requestParams: requestParamsConfiguration,
  repository: repositoryConfiguration,
  apps: appsConfiguration,
};
