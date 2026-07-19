import type { NamespaceBuilder } from './index';

export function DtoNames(this: NamespaceBuilder) {
  const suffix = Context.config.entities.dto.fileSuffix.substring(1);

  const entityNamed = [this.finalName, suffix].toHump();
  const createNamed = [this.finalName, Context.config.useCase.restful.created, suffix].toHump();
  const updateNamed = [this.finalName, Context.config.useCase.restful.updated, suffix].toHump();

  const entityFilename = [this.sourceName, suffix].join('.');
  const createFilename = [[this.sourceName, Context.config.useCase.restful.created].toLine(), suffix].join('.');
  const updateFilename = [[this.sourceName, Context.config.useCase.restful.updated].toLine(), suffix].join('.');

  return {
    entity: { named: entityNamed, filename: entityFilename },
    create: { named: createNamed, filename: createFilename },
    update: { named: updateNamed, filename: updateFilename },
  };
}
