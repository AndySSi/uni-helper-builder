import ts from 'typescript';
import * as bt from '@babel/types';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

import { I_FILE_SPACED, I_FILE_SPACED_AST, ORIGINAL_KEYS } from 'src/_constants';

import { HttpMethods, ResultType, UseCaseType } from '../models';
import { UseCaseContext } from '../context';

export const buildCases = () =>
  withBuilder(async () => {
    UseCaseContext.cases.rootPath.readDir();

    const caseCode = await BuildByMethodTypeStrategy[UseCaseContext.methodType]();

    if (!caseCode) {
      throw new Error('code');
    }

    const indexPath = [UseCaseContext.cases.rootPath, Context.config.useCase.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;

    const ast = indexPath.toUtf8Code.parseBabel;

    const lastImport = ast.program.body.findRight((item) => bt.isImportDeclaration(item));

    const currentImportCase = bt.importDeclaration([bt.importDefaultSpecifier(bt.identifier(UseCaseContext.cases.casesName))], bt.stringLiteral(`./${UseCaseContext.cases.filename}`));

    if (lastImport && lastImport.index >= 0) {
      ast.program.body.splice(lastImport.index + 1, 0, currentImportCase);
    } else {
      ast.program.body.unshift(currentImportCase);
    }

    traverse(ast, {
      enter(path) {
        if (bt.isExportDeclaration(path.node)) {
          path.insertBefore(I_FILE_SPACED_AST);
        }

        if (bt.isClassBody(path.node)) {
          path.node.body.push(buildUseCaseMethod());

          const afterBody: any[] = [];
          path.node.body.forEach((item) => {
            afterBody.push(item);
            afterBody.push(I_FILE_SPACED_AST);
          });
          path.node.body = afterBody;
        }
      },
    });

    const indexData = generate(ast).code.replaceAll(I_FILE_SPACED, '\n');

    return {
      root: null,
      codes: [
        [UseCaseContext.cases.filepath, caseCode],
        [indexPath, indexData],
      ],
    };
  });

function buildUseCaseMethod() {
  const code = [
    [Object.identifier({ text: UseCaseContext.cases.casesName }).newExpression({}).returnStatement()]
      .block({})
      .getAccessorDeclaration({ modifiers: [Object.modifier.publicKeyword], name: UseCaseContext.caseName.toHump() }),
  ]
    .classDeclaration({
      name: 'temp',
    })
    .toStructure();

  const babelAst = code.parseBabel.program.body[0] as unknown as bt.ClassDeclaration;

  return babelAst.body.body[0] as bt.ClassMethod;
}

class BuildByMethodTypeStrategy {
  static async [HttpMethods.get]() {
    return await BuildByGetCaseTypeStrategy[UseCaseContext.caseType]();
  }
  static async [HttpMethods.post]() {
    return basicUseCaseBuild();
  }
  static async [HttpMethods.put]() {
    return basicUseCaseBuild();
  }
  static async [HttpMethods.delete]() {
    return basicUseCaseBuild();
  }
}

class BuildByGetCaseTypeStrategy {
  static async [UseCaseType.basic]() {
    const { requestParams, entities, repository } = UseCaseContext;
    const { hookName, override } = Context.config.useCase.models.basic;
    const { entities: configEntities, requestParams: configRequestParams, repository: configRepository } = Context.config;

    const code = [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [Object.identifier({ text: hookName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configEntities.dirname.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: entities.entityName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configRequestParams.dirname.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: requestParams.annotationName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configRepository.entry.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: repository.repositoryName }).importSpecifier({})].namedImports().importClause({}),
      }),

      [
        [core()].block({}).methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: override.onRun,
          parameters: [
            Object.identifier({ text: configRepository.httpApi.params }).parameterDeclaration({
              type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}),
            }),
          ],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({ typeArguments: [Object.identifier({ text: entities.entityName }).typeReferenceNode({})] }),
        }),
      ].classDeclaration({
        modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
        name: UseCaseContext.cases.casesName,
        heritageClauses: [
          [
            Object.identifier({ text: hookName }).expressionWithTypeArguments({
              typeArguments: [Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}), Object.identifier({ text: entities.entityName }).typeReferenceNode({})],
            }),
          ].heritageClause({
            token: ts.SyntaxKind.ExtendsKeyword,
          }),
        ],
      }),
    ].toStructure();

    return code;
  }

  static async [UseCaseType.module]() {
    const { requestParams, entities, repository } = UseCaseContext;
    const { hookName, override } = Context.config.useCase.models.module;
    const { entities: configEntities, requestParams: configRequestParams, repository: configRepository } = Context.config;

    const code = [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [Object.identifier({ text: hookName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configEntities.dirname.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: entities.entityName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configRequestParams.dirname.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: requestParams.annotationName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configRepository.entry.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: repository.repositoryName }).importSpecifier({})].namedImports().importClause({}),
      }),

      [
        [core()].block({}).methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: override.onRun,
          parameters: [
            Object.identifier({ text: configRepository.httpApi.params }).parameterDeclaration({
              type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}),
            }),
          ],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({ typeArguments: [Object.identifier({ text: entities.entityName }).typeReferenceNode({})] }),
        }),
      ].classDeclaration({
        modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
        name: UseCaseContext.cases.casesName,
        heritageClauses: [
          [
            Object.identifier({ text: hookName }).expressionWithTypeArguments({
              typeArguments: [Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}), Object.identifier({ text: entities.entityName }).typeReferenceNode({})],
            }),
          ].heritageClause({
            token: ts.SyntaxKind.ExtendsKeyword,
          }),
        ],
      }),
    ].toStructure();

    return code;
  }

  static async [UseCaseType.paginator]() {
    const { requestParams, entities, repository } = UseCaseContext;
    const { hookName, annotation, override } = Context.config.useCase.models.paginator;
    const { entities: configEntities, requestParams: configRequestParams, repository: configRepository } = Context.config;

    const code = [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [Object.identifier({ text: hookName }).importSpecifier({}), Object.identifier({ text: annotation.pagedResultDto }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configEntities.dirname.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: entities.entityName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configRequestParams.dirname.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: requestParams.annotationName }).importSpecifier({})].namedImports().importClause({}),
      }),
      Object.stringLiteral({ text: configRepository.entry.padPrefix('../') }).importDeclaration({
        importClause: [Object.identifier({ text: repository.repositoryName }).importSpecifier({})].namedImports().importClause({}),
      }),

      [
        [core()].block({}).methodDeclaration({
          modifiers: [Object.modifier.protectedKeyword],
          name: override.onRun,
          parameters: [
            Object.identifier({ text: configRepository.httpApi.params }).parameterDeclaration({
              type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}),
            }),
          ],
          type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({
            typeArguments: [
              Object.identifier({ text: annotation.pagedResultDto }).typeReferenceNode({
                typeArguments: [Object.identifier({ text: entities.entityName }).typeReferenceNode({})],
              }),
            ],
          }),
        }),
      ].classDeclaration({
        modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
        name: UseCaseContext.cases.casesName,
        heritageClauses: [
          [
            Object.identifier({ text: hookName }).expressionWithTypeArguments({
              typeArguments: [Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}), Object.identifier({ text: entities.entityName }).typeReferenceNode({})],
            }),
          ].heritageClause({
            token: ts.SyntaxKind.ExtendsKeyword,
          }),
        ],
      }),
    ].toStructure();

    return code;
  }
}

const basicUseCaseBuild = async () => {
  const { requestParams, entities, repository } = UseCaseContext;
  const { hookName, override } = Context.config.useCase.models.basic;
  const { entities: configEntities, requestParams: configRequestParams, repository: configRepository } = Context.config;

  const resultAnnotation = {
    [ResultType.any]: Object.keywordTypeNode.typeNodeAny,
    [ResultType.dto]: Object.identifier({ text: entities.entityName }).typeReferenceNode({}),
    [ResultType.void]: Object.keywordTypeNode.typeNodeVoid,
  }[UseCaseContext.resultType];

  const imports = [
    Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
      importClause: [Object.identifier({ text: hookName }).importSpecifier({})].namedImports().importClause({}),
    }),
    ...(UseCaseContext.resultType === ResultType.dto
      ? [
          Object.stringLiteral({ text: configEntities.dirname.padPrefix('../') }).importDeclaration({
            importClause: [Object.identifier({ text: entities.entityName }).importSpecifier({})].namedImports().importClause({}),
          }),
        ]
      : []),
    Object.stringLiteral({ text: configRequestParams.dirname.padPrefix('../') }).importDeclaration({
      importClause: [Object.identifier({ text: requestParams.annotationName }).importSpecifier({})].namedImports().importClause({}),
    }),
    Object.stringLiteral({ text: configRepository.entry.padPrefix('../') }).importDeclaration({
      importClause: [Object.identifier({ text: repository.repositoryName }).importSpecifier({})].namedImports().importClause({}),
    }),
  ];

  const code = [
    ...imports,

    [
      [core()].block({}).methodDeclaration({
        modifiers: [Object.modifier.protectedKeyword],
        name: override.onRun,
        parameters: [
          Object.identifier({ text: configRepository.httpApi.params }).parameterDeclaration({
            type: Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}),
          }),
        ],
        type: Object.identifier({ text: ORIGINAL_KEYS.promise }).typeReferenceNode({ typeArguments: [resultAnnotation] }),
      }),
    ].classDeclaration({
      modifiers: [Object.modifier.exportKeyword, Object.modifier.defaultKeyword],
      name: UseCaseContext.cases.casesName,
      heritageClauses: [
        [
          Object.identifier({ text: hookName }).expressionWithTypeArguments({
            typeArguments: [Object.identifier({ text: requestParams.annotationName }).typeReferenceNode({}), resultAnnotation],
          }),
        ].heritageClause({
          token: ts.SyntaxKind.ExtendsKeyword,
        }),
      ],
    }),
  ].toStructure();

  return code;
};
const core = () => {
  const { repository } = UseCaseContext;
  const { repository: configRepository } = Context.config;

  if (Array.isArray(configRepository.enableSingleton)) {
    return Object.identifier({ text: repository.repositoryName })
      .callExpression({})
      .propertyAccessExpression({ name: UseCaseContext.caseName.toHump() })
      .callExpression({ argumentsArray: [Object.identifier({ text: configRepository.httpApi.params })] })
      .returnStatement();
  }

  return Object.identifier({ text: repository.repositoryName })
    .propertyAccessExpression({ name: UseCaseContext.caseName.toHump() })
    .callExpression({ argumentsArray: [Object.identifier({ text: configRepository.httpApi.params })] })
    .returnStatement();
};
