import type { NamespaceBuilder } from './index';

export function EventNames(this: NamespaceBuilder) {
  const createNamed = [Context.config.domain.override.on, this.sourceName, Context.config.useCase.restful.created].toHump();
  const updateNamed = [Context.config.domain.override.on, this.sourceName, Context.config.useCase.restful.updated].toHump();
  const deleteNamed = [Context.config.domain.override.on, this.sourceName, Context.config.useCase.restful.deleted].toHump();

  const createAnnotation = [this.finalName, Context.config.useCase.restful.created, Context.config.domain.override.args].toHump();
  const updateAnnotation = [this.finalName, Context.config.useCase.restful.updated, Context.config.domain.override.args].toHump();
  const deleteAnnotation = [this.finalName, Context.config.useCase.restful.deleted, Context.config.domain.override.args].toHump();

  return {
    create: { named: createNamed, annotation: createAnnotation },
    update: { named: updateNamed, annotation: updateAnnotation },
    delete: { named: deleteNamed, annotation: deleteAnnotation },
  };
}
