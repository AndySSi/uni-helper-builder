import { NamespaceBuilder } from './index';

export function CasesNames(this: NamespaceBuilder) {
  const getByIdNamed = [this.finalName, Context.config.useCase.restful.detail, Context.config.useCase.fileSuffix].toHump();
  const paginatorNamed = [this.finalName, Context.config.useCase.restful.paginator, Context.config.useCase.fileSuffix].toHump();
  const createdNamed = [this.finalName, Context.config.useCase.restful.created, Context.config.useCase.fileSuffix].toHump();
  const updatedNamed = [this.finalName, Context.config.useCase.restful.updated, Context.config.useCase.fileSuffix].toHump();
  const deletedNamed = [this.finalName, Context.config.useCase.restful.deleted, Context.config.useCase.fileSuffix].toHump();

  const getByIdFilename = [this.sourceName, Context.config.useCase.restful.detail.toLine(), Context.config.useCase.fileSuffix].toLine();
  const paginatorFilename = [this.sourceName, Context.config.useCase.restful.paginator, Context.config.useCase.fileSuffix].toLine();
  const createdFilename = [this.sourceName, Context.config.useCase.restful.created, Context.config.useCase.fileSuffix].toLine();
  const updatedFilename = [this.sourceName, Context.config.useCase.restful.updated, Context.config.useCase.fileSuffix].toLine();
  const deletedFilename = [this.sourceName, Context.config.useCase.restful.deleted, Context.config.useCase.fileSuffix].toLine();

  return {
    getById: { named: getByIdNamed, filename: getByIdFilename },
    paginator: { named: paginatorNamed, filename: paginatorFilename },
    created: { named: createdNamed, filename: createdFilename },
    updated: { named: updatedNamed, filename: updatedFilename },
    deleted: { named: deletedNamed, filename: deletedFilename },
  };
}
