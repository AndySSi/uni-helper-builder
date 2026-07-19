import { NamespaceBuilder } from './index';

export function ParamNames(this: NamespaceBuilder) {
  const getByIdQuery = [this.finalName, Context.config.useCase.restful.detail, Context.config.repository.httpApi.properties.query].toHump();
  const paginatorQuery = [this.finalName, Context.config.useCase.restful.paginator, Context.config.repository.httpApi.properties.query].toHump();
  const removedBody = [this.finalName, Context.config.useCase.restful.deleted, Context.config.repository.httpApi.properties.body].toHump();

  const getByIdFilename = [this.sourceName, Context.config.useCase.restful.detail, Context.config.repository.httpApi.properties.query].toLine();
  const paginatorFilename = [this.sourceName, Context.config.useCase.restful.paginator, Context.config.repository.httpApi.properties.query].toLine();
  const removedFilename = [this.sourceName, Context.config.useCase.restful.deleted, Context.config.repository.httpApi.properties.body].toLine();

  return {
    getByIdQuery: { named: getByIdQuery, filename: getByIdFilename },
    paginatorQuery: { named: paginatorQuery, filename: paginatorFilename },
    removedBody: { named: removedBody, filename: removedFilename },
  };
}
