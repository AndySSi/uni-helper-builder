import ts from 'typescript';

import { keywords, ORIGINAL_KEYS } from 'src/_constants';

import { DomainRuntime } from '../context';
import { buildImports } from './build_imports';

export const getUseCaseIndexRestfulAst = async () => {
  const { cases, aggregateRoot } = DomainRuntime.namespace;
  const { getById, paginator, created, updated, deleted } = cases;

  return [
    ...buildImports([
      [getById.filename.padPrefix('./'), getById.named, true],
      [paginator.filename.padPrefix('./'), paginator.named, true],
      [created.filename.padPrefix('./'), created.named, true],
      [updated.filename.padPrefix('./'), updated.named, true],
      [deleted.filename.padPrefix('./'), deleted.named, true],
    ]),

    [
      ...[
        { name: Context.config.repository.restful.getById, named: getById.named },
        { name: Context.config.repository.restful.getAll, named: paginator.named },
        { name: Context.config.repository.restful.create, named: created.named },
        { name: Context.config.repository.restful.update, named: updated.named },
        { name: Context.config.repository.restful.remove, named: deleted.named },
      ].map((res) =>
        [Object.identifier({ text: res.named }).newExpression({}).returnStatement()].block({}).getAccessorDeclaration({
          modifiers: [Object.modifier.publicKeyword],
          name: res.name,
        }),
      ),
    ].classDeclaration({
      modifiers: [Object.modifier.exportKeyword],
      name: aggregateRoot,
    }),
  ].toStructure();
};

export const getUseCaseGetByIdRestfulAst = async () => {
  const { cases, params, dto, repository } = DomainRuntime.namespace;

  return [
    ...buildImports([
      [Context.config.dependencyName, Context.config.useCase.models.module.hookName],
      [Context.config.requestParams.dirname.padPrefix('../'), params.getByIdQuery.named],
      [Context.config.entities.dirname.padPrefix('../'), dto.entity.named],
      [Context.config.repository.entry.padPrefix('../'), repository],
    ]),

    [
      [
        Object.identifier({ text: repository })
          .callExpression({})
          .propertyAccessExpression({ name: Context.config.repository.restful.getById })
          .callExpression({ argumentsArray: [Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAccessExpression({ name: keywords.id })] })
          .returnStatement(),
      ]
        .block({})
        .methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: Context.config.useCase.models.module.override.onRun,
          parameters: [
            Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: params.getByIdQuery.named }).typeReferenceNode({}) }),
          ],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({ typeArguments: [Object.identifier({ text: dto.entity.named }).typeReferenceNode({})] }),
        }),
    ].classDeclaration({
      modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
      name: cases.getById.named,
      heritageClauses: [
        [
          Object.identifier({ text: Context.config.useCase.models.module.hookName }).expressionWithTypeArguments({
            typeArguments: [Object.identifier({ text: params.getByIdQuery.named }).typeReferenceNode({}), Object.identifier({ text: dto.entity.named }).typeReferenceNode({})],
          }),
        ].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword }),
      ],
    }),
  ].toStructure();
};

export const getUseCasePaginatorRestfulAst = async () => {
  const { cases, params, dto, repository } = DomainRuntime.namespace;

  return [
    ...buildImports([
      [Context.config.dependencyName, [Context.config.useCase.models.paginator.hookName, Context.config.useCase.models.paginator.annotation.pagedResultDto]],
      [Context.config.requestParams.dirname.padPrefix('../'), params.paginatorQuery.named],
      [Context.config.entities.dirname.padPrefix('../'), dto.entity.named],
      [Context.config.repository.entry.padPrefix('../'), repository],
    ]),

    [
      [
        Object.identifier({ text: repository })
          .callExpression({})
          .propertyAccessExpression({ name: Context.config.repository.restful.getAll })
          .callExpression({ argumentsArray: [Object.identifier({ text: Context.config.repository.httpApi.params })] })
          .returnStatement(),
      ]
        .block({})
        .methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: Context.config.useCase.models.paginator.override.onRun,
          parameters: [
            Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: params.paginatorQuery.named }).typeReferenceNode({}) }),
          ],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({
            typeArguments: [
              Object.identifier({ text: Context.config.useCase.models.paginator.annotation.pagedResultDto }).typeReferenceNode({
                typeArguments: [Object.identifier({ text: dto.entity.named }).typeReferenceNode({})],
              }),
            ],
          }),
        }),
    ].classDeclaration({
      modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
      name: cases.paginator.named,
      heritageClauses: [
        [
          Object.identifier({ text: Context.config.useCase.models.paginator.hookName }).expressionWithTypeArguments({
            typeArguments: [Object.identifier({ text: params.paginatorQuery.named }).typeReferenceNode({}), Object.identifier({ text: dto.entity.named }).typeReferenceNode({})],
          }),
        ].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword }),
      ],
    }),
  ].toStructure();
};

export const getUseCaseCreatedRestfulAst = async () => {
  const { cases, dto, repository } = DomainRuntime.namespace;

  return [
    ...buildImports([
      [Context.config.dependencyName, Context.config.useCase.models.basic.hookName],
      [Context.config.entities.dirname.padPrefix('../'), [dto.entity.named, dto.create.named]],
      [Context.config.repository.entry.padPrefix('../'), repository],
    ]),

    [
      [
        Object.identifier({ text: repository })
          .callExpression({})
          .propertyAccessExpression({ name: Context.config.repository.restful.create })
          .callExpression({ argumentsArray: [Object.identifier({ text: Context.config.repository.httpApi.params })] })
          .returnStatement(),
      ]
        .block({})
        .methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: Context.config.useCase.models.basic.override.onRun,
          parameters: [Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: dto.create.named }).typeReferenceNode({}) })],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({
            typeArguments: [Object.identifier({ text: dto.entity.named }).typeReferenceNode({})],
          }),
        }),
    ].classDeclaration({
      modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
      name: cases.created.named,
      heritageClauses: [
        [
          Object.identifier({ text: Context.config.useCase.models.basic.hookName }).expressionWithTypeArguments({
            typeArguments: [Object.identifier({ text: dto.create.named }).typeReferenceNode({}), Object.identifier({ text: dto.entity.named }).typeReferenceNode({})],
          }),
        ].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword }),
      ],
    }),
  ].toStructure();
};

export const getUseCaseUpdatedRestfulAst = async () => {
  const { cases, dto, repository } = DomainRuntime.namespace;

  return [
    ...buildImports([
      [Context.config.dependencyName, Context.config.useCase.models.basic.hookName],
      [Context.config.entities.dirname.padPrefix('../'), dto.update.named],
      [Context.config.repository.entry.padPrefix('../'), repository],
    ]),

    [
      [
        Object.identifier({ text: repository })
          .callExpression({})
          .propertyAccessExpression({ name: Context.config.repository.restful.update })
          .callExpression({ argumentsArray: [Object.identifier({ text: Context.config.repository.httpApi.params })] })
          .returnStatement(),
      ]
        .block({})
        .methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: Context.config.useCase.models.basic.override.onRun,
          parameters: [Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: dto.update.named }).typeReferenceNode({}) })],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({
            typeArguments: [Object.keywordTypeNode.typeNodeVoid],
          }),
        }),
    ].classDeclaration({
      modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
      name: cases.updated.named,
      heritageClauses: [
        [
          Object.identifier({ text: Context.config.useCase.models.basic.hookName }).expressionWithTypeArguments({
            typeArguments: [Object.identifier({ text: dto.update.named }).typeReferenceNode({}), Object.keywordTypeNode.typeNodeVoid],
          }),
        ].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword }),
      ],
    }),
  ].toStructure();
};

export const getUseCaseDeletedRestfulAst = async () => {
  const { cases, params, repository } = DomainRuntime.namespace;

  return [
    ...buildImports([
      [Context.config.dependencyName, Context.config.useCase.models.basic.hookName],
      [Context.config.requestParams.dirname.padPrefix('../'), params.removedBody.named],
      [Context.config.repository.entry.padPrefix('../'), repository],
    ]),

    [
      [
        Object.identifier({ text: repository })
          .callExpression({})
          .propertyAccessExpression({ name: Context.config.repository.restful.remove })
          .callExpression({ argumentsArray: [Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAccessExpression({ name: keywords.id })] })
          .returnStatement(),
      ]
        .block({})
        .methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: Context.config.useCase.models.basic.override.onRun,
          parameters: [
            Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: params.removedBody.named }).typeReferenceNode({}) }),
          ],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({
            typeArguments: [Object.keywordTypeNode.typeNodeVoid],
          }),
        }),
    ].classDeclaration({
      modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
      name: cases.deleted.named,
      heritageClauses: [
        [
          Object.identifier({ text: Context.config.useCase.models.basic.hookName }).expressionWithTypeArguments({
            typeArguments: [Object.identifier({ text: params.removedBody.named }).typeReferenceNode({}), Object.keywordTypeNode.typeNodeVoid],
          }),
        ].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword }),
      ],
    }),
  ].toStructure();
};
