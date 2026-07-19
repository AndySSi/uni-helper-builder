import { RepositoryConfiguration } from 'types';

export const repositoryConfiguration: RepositoryConfiguration = {
  entry: 'repository',
  namespace: '{{name}}Repository',
  override: {
    pathBuilder: {
      hookName: 'pathBuilder',
      override: {
        resolve: 'resolve',
      },
    },
  },
  hookName: 'BaseRepository',
  restful: {
    getAll: 'getAll',
    getById: 'getById',
    create: 'create',
    update: 'update',
    remove: 'remove',
  },
  httpApi: {
    entry: 'src/http',
    hookName: 'HttpApi',
    params: 'params',
    response: 'response',
    properties: {
      url: 'url',
      method: 'method',
      formatter: 'formatter',
      query: 'query',
      body: 'body',
    },
    override: {
      request: 'request',
    },
  },
  enableSingleton: true,
};
