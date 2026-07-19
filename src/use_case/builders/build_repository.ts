import type { ParseResult } from '@babel/parser';

import * as bt from '@babel/types';
import generate from '@babel/generator';
import ts from 'typescript';
import traverse, { NodePath } from '@babel/traverse';

import { DEPENDENCIES_INFO, I_FILE_SPACED, I_FILE_SPACED_AST } from 'src/_constants';
import { HttpMethods, ResultType, UseCaseType } from '../models';
import { UseCaseContext } from '../context';
import { requestParamsAst } from '../ast_template';

export const buildRepository = () =>
  withBuilder(async () => {
    const namespace = UseCaseContext.repository;

    const repositoryAst = namespace.rootPath.toUtf8Code.parseBabel;

    const { classCode } = await BuildByMethodType[UseCaseContext.methodType]();

    const babelAst = classCode.parseBabel.program.body[0] as unknown as bt.ClassDeclaration;

    padImport(repositoryAst);

    traverse(repositoryAst, {
      enter(path) {
        if (bt.isClassDeclaration(path.node)) {
          path.insertAfter(I_FILE_SPACED_AST);
          path.insertBefore(I_FILE_SPACED_AST);
        }

        if (bt.isReturnStatement(path.node)) {
          path.insertBefore(I_FILE_SPACED_AST);
        }

        if (validRepositoryBody(path)) {
          const methods = path.node.body.find((item) => bt.isClassMethod(item) && bt.isIdentifier(item.key) && item.key.name === UseCaseContext.caseName);
          if (!methods) {
            path.node.body.push(babelAst.body.body[0] as bt.ClassMethod);
          }
        }

        if (bt.isClassDeclaration(path.node) && path.node.id?.name.includes('Repository')) {
          path.insertBefore(I_FILE_SPACED_AST);
          const afterBody: any[] = [];
          path.node.body.body.forEach((item) => {
            afterBody.push(item);
            afterBody.push(I_FILE_SPACED_AST);
          });
          path.node.body.body = afterBody;
        }
      },
    });

    const code = generate(repositoryAst).code.replaceAll(I_FILE_SPACED, '\n');

    const data = await code.formatter;

    return { root: null, codes: [[namespace.rootPath, data]] };
  });

function validRepositoryBody(path: NodePath<bt.Node>): path is NodePath<bt.ClassBody> {
  return (
    bt.isClassBody(path.node) &&
    bt.isClassDeclaration(path.parent) &&
    bt.isIdentifier(path.parent.superClass) &&
    path.parent.superClass.name === Context.config.repository.hookName &&
    bt.isIdentifier(path.parent.id) &&
    path.parent.id.name.includes('Repository')
  );
}

class BuildByMethodType {
  static async [HttpMethods.get]() {
    return await BuildByGetCaseType[UseCaseContext.caseType]();
  }
  static async [HttpMethods.post]() {
    const { requestParams, entities } = UseCaseContext;

    const bodyAst: IStructure<ts.Statement>[] = [];

    const _requestParamsAst = [
      ...requestParamsAst(),
      Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAssignment({ name: Context.config.repository.httpApi.properties.body }),
      ...(UseCaseContext.resultType === ResultType.dto
        ? [
            Object.identifier({ text: entities.entityName })
              .propertyAccessExpression({
                name: Context.config.entities.dto.override.fromJson,
              })
              .propertyAssignment({ name: Context.config.repository.httpApi.properties.formatter }),
          ]
        : []),
    ].objectLiteralExpression({});

    const requestBodyAst = Object.this()
      .propertyAccessExpression({ name: Context.config.repository.httpApi.hookName.firstToLower })
      .propertyAccessExpression({ name: Context.config.repository.httpApi.override.request })
      .callExpression({
        argumentsArray: [_requestParamsAst],
      })
      .awaitExpression();

    if (UseCaseContext.resultType !== ResultType.void) {
      bodyAst.push([requestBodyAst.variableDeclaration({ name: Context.config.repository.httpApi.response })].variableDeclarationList({ flags: ts.NodeFlags.Const }).variableStatement({}));
      bodyAst.push(Object.identifier({ text: Context.config.repository.httpApi.response }).returnStatement());
    } else {
      bodyAst.push(requestBodyAst);
    }

    const classCode = [
      [
        bodyAst.block({}).methodDeclaration({
          modifiers: [Object.modifier.asyncKeyword],
          name: Object.identifier({ text: UseCaseContext.sourceName }),
          parameters: [
            Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}) }),
          ],
        }),
      ].classDeclaration({
        name: 'temp',
      }),
    ].toStructure();

    return { classCode };
  }
  static async [HttpMethods.put]() {
    const { requestParams, entities } = UseCaseContext;

    const bodyAst: IStructure<ts.Statement>[] = [];

    const _requestParamsAst = [
      ...requestParamsAst(),
      Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAssignment({ name: Context.config.repository.httpApi.properties.body }),
    ];

    if (UseCaseContext.resultType === ResultType.dto) {
      _requestParamsAst.push(
        Object.identifier({ text: entities.entityName })
          .propertyAccessExpression({
            name: Context.config.entities.dto.override.fromJson,
          })
          .propertyAssignment({ name: Context.config.repository.httpApi.properties.formatter }),
      );
    }

    const requestBodyAst = Object.this()
      .propertyAccessExpression({ name: Context.config.repository.httpApi.hookName.firstToLower })
      .propertyAccessExpression({ name: Context.config.repository.httpApi.override.request })
      .callExpression({
        argumentsArray: [_requestParamsAst.objectLiteralExpression({})],
      })
      .awaitExpression();

    if (UseCaseContext.resultType !== ResultType.void) {
      bodyAst.push([requestBodyAst.variableDeclaration({ name: Context.config.repository.httpApi.response })].variableDeclarationList({ flags: ts.NodeFlags.Const }).variableStatement({}));
      bodyAst.push(Object.identifier({ text: Context.config.repository.httpApi.response }).returnStatement());
    } else {
      bodyAst.push(requestBodyAst);
    }

    const classCode = [
      [
        bodyAst.block({}).methodDeclaration({
          modifiers: [Object.modifier.asyncKeyword],
          name: Object.identifier({ text: UseCaseContext.sourceName }),
          parameters: [
            Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}) }),
          ],
        }),
      ].classDeclaration({
        name: 'temp',
      }),
    ].toStructure();

    return { classCode };
  }
  static async [HttpMethods.delete]() {
    const requestParams = UseCaseContext.requestParams;

    const classCode = [
      [
        [
          Object.this()
            .propertyAccessExpression({ name: Context.config.repository.httpApi.hookName.firstToLower })
            .propertyAccessExpression({ name: Context.config.repository.httpApi.override.request })
            .callExpression({
              argumentsArray: [
                [
                  ...requestParamsAst(),
                  Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAssignment({ name: Context.config.repository.httpApi.properties.body }),
                ].objectLiteralExpression({}),
              ],
            })
            .awaitExpression(),
        ]
          .block({})
          .methodDeclaration({
            modifiers: [Object.modifier.asyncKeyword],
            name: Object.identifier({ text: UseCaseContext.sourceName }),
            parameters: [
              Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}) }),
            ],
          }),
      ].classDeclaration({
        name: 'temp',
      }),
    ].toStructure();

    return { classCode };
  }
}

class BuildByGetCaseType {
  static async [UseCaseType.basic]() {
    const { requestParams, entities } = UseCaseContext;

    const classCode = [
      [
        [
          [
            Object.this()
              .propertyAccessExpression({ name: Context.config.repository.httpApi.hookName.firstToLower })
              .propertyAccessExpression({ name: Context.config.repository.httpApi.override.request })
              .callExpression({
                argumentsArray: [
                  [
                    ...requestParamsAst(),

                    Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAssignment({ name: Context.config.repository.httpApi.properties.query }),

                    Object.identifier({ text: entities.entityName })
                      .propertyAccessExpression({ name: Context.config.entities.dto.override.fromJson })
                      .propertyAssignment({ name: Context.config.repository.httpApi.properties.formatter }),
                  ].objectLiteralExpression({}),
                ],
              })
              .awaitExpression()
              .variableDeclaration({ name: Context.config.repository.httpApi.response }),
          ]
            .variableDeclarationList({ flags: ts.NodeFlags.Const })
            .variableStatement({}),

          Object.identifier({ text: Context.config.repository.httpApi.response }).returnStatement(),
        ]
          .block({})
          .methodDeclaration({
            modifiers: [Object.modifier.asyncKeyword],
            name: Object.identifier({ text: UseCaseContext.sourceName }),
            parameters: [
              Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}) }),
            ],
          }),
      ].classDeclaration({
        name: 'temp',
      }),
    ].toStructure();

    return { classCode };
  }

  static async [UseCaseType.module]() {
    const { requestParams, entities } = UseCaseContext;

    const classCode = [
      [
        [
          [
            Object.this()
              .propertyAccessExpression({ name: Context.config.repository.httpApi.hookName.firstToLower })
              .propertyAccessExpression({ name: Context.config.repository.httpApi.override.request })
              .callExpression({
                argumentsArray: [
                  [
                    ...requestParamsAst(),

                    Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAssignment({ name: Context.config.repository.httpApi.properties.query }),

                    Object.identifier({ text: entities.entityName })
                      .propertyAccessExpression({ name: Context.config.entities.dto.override.fromJson })
                      .propertyAssignment({ name: Context.config.repository.httpApi.properties.formatter }),
                  ].objectLiteralExpression({}),
                ],
              })
              .awaitExpression()
              .variableDeclaration({ name: Context.config.repository.httpApi.response }),
          ]
            .variableDeclarationList({ flags: ts.NodeFlags.Const })
            .variableStatement({}),

          Object.identifier({ text: Context.config.repository.httpApi.response }).returnStatement(),
        ]
          .block({})
          .methodDeclaration({
            modifiers: [Object.modifier.asyncKeyword],
            name: Object.identifier({ text: UseCaseContext.sourceName }),
            parameters: [
              Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}) }),
            ],
          }),
      ].classDeclaration({
        name: 'temp',
      }),
    ].toStructure();

    return { classCode };
  }

  static async [UseCaseType.paginator]() {
    const { requestParams, entities } = UseCaseContext;

    const classCode = [
      [
        [
          [
            Object.this()
              .propertyAccessExpression({ name: Context.config.repository.httpApi.hookName.firstToLower })
              .propertyAccessExpression({ name: Context.config.repository.httpApi.override.request })
              .callExpression({
                argumentsArray: [
                  [
                    ...requestParamsAst(),

                    Object.identifier({ text: Context.config.repository.httpApi.params }).propertyAssignment({ name: Context.config.repository.httpApi.properties.query }),

                    Object.identifier({ text: entities.entityName })
                      .propertyAccessExpression({ name: Context.config.entities.dto.override.toList })
                      .propertyAssignment({ name: Context.config.repository.httpApi.properties.formatter }),
                  ].objectLiteralExpression({}),
                ],
              })
              .awaitExpression()
              .variableDeclaration({ name: Context.config.repository.httpApi.response }),
          ]
            .variableDeclarationList({ flags: ts.NodeFlags.Const })
            .variableStatement({}),

          [Object.identifier({ text: Context.config.repository.httpApi.response }).propertyAssignment({ name: DEPENDENCIES_INFO.project.list })]
            .objectLiteralExpression({})
            .asExpression({
              type: Object.identifier({ text: Context.config.useCase.models.paginator.annotation.pagedResultDto }).typeReferenceNode({
                typeArguments: [Object.identifier({ text: entities.entityName }).typeReferenceNode({})],
              }),
            })
            .returnStatement(),
        ]
          .block({})
          .methodDeclaration({
            modifiers: [Object.modifier.asyncKeyword],
            name: Object.identifier({ text: UseCaseContext.sourceName }),
            parameters: [
              Object.identifier({ text: Context.config.repository.httpApi.params }).parameterDeclaration({ type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}) }),
            ],
          }),
      ].classDeclaration({
        name: 'temp',
      }),
    ].toStructure();

    return { classCode };
  }
}

function padImport(ast: ParseResult<bt.File>) {
  padDependencies(ast);

  padRequestParams(ast);

  padEntities(ast);
}

function padDependencies(ast: ParseResult<bt.File>) {
  const repositoryAstBody = ast.program.body;
  const importDependencies = repositoryAstBody.find((item) => bt.isImportDeclaration(item) && item.source.value === Context.config.dependencyName) as bt.ImportDeclaration;

  const dependencies = [Context.config.repository.hookName, Context.config.dependencies.httpRequestMethod.hookName];

  if (Array.isArray(Context.config.repository.enableSingleton)) {
    if (Context.config.repository.enableSingleton[0] === Context.config.dependencyName) {
      dependencies.push(Context.config.repository.enableSingleton[1]);
    }
  }

  if (UseCaseContext.caseType === UseCaseType.paginator) {
    dependencies.push(Context.config.useCase.models.paginator.annotation.pagedResultDto);
  }

  if (importDependencies) {
    dependencies.forEach((depend) => {
      const index = importDependencies.specifiers.findIndex((res) => bt.isImportSpecifier(res) && res.local.name === depend);
      if (index === -1) {
        importDependencies.specifiers.push(bt.importSpecifier(bt.identifier(depend), bt.identifier(depend)));
      }
    });
  } else {
    repositoryAstBody.unshift(
      bt.importDeclaration(
        dependencies.map((item) => bt.importSpecifier(bt.identifier(item), bt.identifier(item))),
        bt.stringLiteral(Context.config.dependencyName),
      ),
    );
  }
}

function padRequestParams(ast: ParseResult<bt.File>) {
  const requestParams = UseCaseContext.requestParams;

  if (requestParams.annotationName) {
    const repositoryAstBody = ast.program.body;
    const source = Context.config.requestParams.dirname.padPrefix('./');
    const importItem = bt.importSpecifier(bt.identifier(requestParams.annotationName), bt.identifier(requestParams.annotationName));

    const requestImport = repositoryAstBody.find((item) => bt.isImportDeclaration(item) && item.source.value === source) as bt.ImportDeclaration;

    if (requestImport) {
      const imported = requestImport.specifiers.findIndex((res) => bt.isImportSpecifier(res) && res.local.name === requestParams.annotationName) !== -1;
      if (!imported) {
        requestImport.specifiers.push(importItem);
      }
    } else {
      const lastImport = repositoryAstBody.findRight((item) => bt.isImportDeclaration(item));
      const imported = bt.importDeclaration([importItem], bt.stringLiteral(source));
      if (lastImport) {
        repositoryAstBody.splice(lastImport.index + 1, 0, imported);
      } else {
        repositoryAstBody.unshift(imported);
      }
    }
  }
}

function padEntities(ast: ParseResult<bt.File>) {
  const { entities, methodType, resultType } = UseCaseContext;

  if (entities.entityName && methodType !== HttpMethods.delete && resultType === ResultType.dto) {
    const repositoryAstBody = ast.program.body;
    const source = Context.config.entities.dirname.padPrefix('./');
    const importItem = bt.importSpecifier(bt.identifier(entities.entityName), bt.identifier(entities.entityName));

    const entitiesImport = repositoryAstBody.find((item) => bt.isImportDeclaration(item) && item.source.value === source) as bt.ImportDeclaration;

    if (entitiesImport) {
      const imported = entitiesImport.specifiers.findIndex((res) => bt.isImportSpecifier(res) && res.local.name === entities.entityName) !== -1;
      if (!imported) {
        entitiesImport.specifiers.push(importItem);
      }
    } else {
      const lastImport = repositoryAstBody.findRight((item) => bt.isImportDeclaration(item));
      const imported = bt.importDeclaration([importItem], bt.stringLiteral(source));
      if (lastImport) {
        repositoryAstBody.splice(lastImport.index + 1, 0, imported);
      } else {
        repositoryAstBody.unshift(imported);
      }
    }
  }
}
