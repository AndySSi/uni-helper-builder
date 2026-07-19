import ts from 'typescript';
import generate from '@babel/generator';

import { DEPENDENCIES_INFO, ORIGINAL_KEYS } from 'src/_constants';

import { HttpMethods, ResultType, UseCaseType } from '../models';
import { UseCaseContext } from '../context';

export const buildEntities = () =>
  withBuilder(async () => {
    const namespace = UseCaseContext.entities;

    namespace.rootPath.readDir();

    const code = await BuildByMethodType[UseCaseContext.methodType]();

    const indexPath = [namespace.rootPath, Context.config.entities.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;
    const exportedCode = [Object.stringLiteral({ text: namespace.filename.padPrefix('./') }).exportDeclaration({})].toStructure();

    const ast = indexPath.toUtf8Code.parseBabel;

    ast.program.body.push(exportedCode.parseBabel.program.body[0]);

    const indexData = await generate(ast).code.formatter;

    return code
      ? {
          root: null,
          codes: [
            [namespace.filepath, code],
            [indexPath, indexData],
          ],
        }
      : undefined;
  });

/* TODO: UseCaseContext.caseType freeze list */

class BuildByMethodType {
  static async [HttpMethods.get]() {
    return await BuildByGetCaseType[UseCaseContext.caseType]();
  }
  static async [HttpMethods.post]() {
    if (UseCaseContext.resultType !== ResultType.dto) {
      return null;
    }

    const namespace = UseCaseContext.entities;

    const code = await [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [
          Object.identifier({ text: Context.config.entities.dto.hookName }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.required }).importSpecifier({}),
        ]
          .namedImports()
          .importClause({}),
      }),

      [
        Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertyDeclaration({
          modifiers: [Object.identifier({ text: Context.config.entities.dto.decorators.required }).callExpression({}).decorator(), Object.modifier.publicKeyword],
          type: Object.keywordTypeNode.typeNodeString,
        }),
      ].classDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.entityName,
        heritageClauses: [[Object.identifier({ text: Context.config.entities.dto.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
      }),
    ].toStructure().formatter;

    return code;
  }
  static async [HttpMethods.put]() {
    if (UseCaseContext.resultType !== ResultType.dto) {
      return null;
    }

    const namespace = UseCaseContext.entities;

    const code = await [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [
          Object.identifier({ text: Context.config.entities.dto.hookName }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.required }).importSpecifier({}),
        ]
          .namedImports()
          .importClause({}),
      }),

      [
        Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertyDeclaration({
          modifiers: [Object.identifier({ text: Context.config.entities.dto.decorators.required }).callExpression({}).decorator(), Object.modifier.publicKeyword],
          type: Object.keywordTypeNode.typeNodeString,
        }),
      ].classDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.entityName,
        heritageClauses: [[Object.identifier({ text: Context.config.entities.dto.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
      }),
    ].toStructure().formatter;

    return code;
  }
  static async [HttpMethods.delete]() {
    if (UseCaseContext.resultType !== ResultType.dto) {
      return null;
    }

    const namespace = UseCaseContext.entities;

    const code = await [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [
          Object.identifier({ text: Context.config.entities.dto.hookName }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.required }).importSpecifier({}),
        ]
          .namedImports()
          .importClause({}),
      }),

      [
        Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertyDeclaration({
          modifiers: [Object.identifier({ text: Context.config.entities.dto.decorators.required }).callExpression({}).decorator(), Object.modifier.publicKeyword],
          type: Object.keywordTypeNode.typeNodeString,
        }),
      ].classDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.entityName,
        heritageClauses: [[Object.identifier({ text: Context.config.entities.dto.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
      }),
    ].toStructure().formatter;

    return code;
  }
}

class BuildByGetCaseType {
  static async [UseCaseType.basic]() {
    const namespace = UseCaseContext.entities;

    const code = await [
      ...getDtoImports(),

      getDtoProperties().classDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.entityName,
        heritageClauses: [[Object.identifier({ text: Context.config.entities.dto.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
      }),
    ].toStructure().formatter;

    return code;
  }

  static async [UseCaseType.module]() {
    const namespace = UseCaseContext.entities;

    const code = await [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [
          Object.identifier({ text: Context.config.entities.dto.hookName }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.freeze }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.required }).importSpecifier({}),
        ]
          .namedImports()
          .importClause({}),
      }),

      (<IStructure<ts.ClassElement>[]>[
        Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertyDeclaration({
          modifiers: [Object.identifier({ text: Context.config.entities.dto.decorators.required }).callExpression({}).decorator(), Object.modifier.publicKeyword],
          type: Object.keywordTypeNode.typeNodeString,
        }),
      ]).classDeclaration({
        modifiers: [Object.identifier({ text: Context.config.entities.dto.decorators.freeze }).decorator(), Object.modifier.exportKeyword],
        name: namespace.entityName,
        heritageClauses: [[Object.identifier({ text: Context.config.entities.dto.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
      }),
    ].toStructure().formatter;

    return code;
  }

  static async [UseCaseType.paginator]() {
    const namespace = UseCaseContext.entities;

    const code = await [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [
          Object.identifier({ text: Context.config.entities.dto.hookName }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.freeze }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.list }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.required }).importSpecifier({}),
        ]
          .namedImports()
          .importClause({}),
      }),

      [
        Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertyDeclaration({
          modifiers: [Object.identifier({ text: Context.config.entities.dto.decorators.required }).callExpression({}).decorator(), Object.modifier.publicKeyword],
          type: Object.keywordTypeNode.typeNodeString,
        }),
      ].classDeclaration({
        modifiers: [
          Object.identifier({ text: Context.config.entities.dto.decorators.freeze }).decorator(),
          Object.identifier({ text: Context.config.entities.dto.decorators.list }).decorator(),
          Object.modifier.exportKeyword,
        ],
        name: namespace.entityName,
        heritageClauses: [[Object.identifier({ text: Context.config.entities.dto.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
      }),
    ].toStructure().formatter;

    return code;
  }
}

// TODO: clean code
// eslint-disable-next-line complexity
function getDtoImports() {
  if (!UseCaseContext.dtoModel) {
    return [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [
          Object.identifier({ text: Context.config.entities.dto.hookName }).importSpecifier({}),
          Object.identifier({ text: Context.config.entities.dto.decorators.required }).importSpecifier({}),
        ]
          .namedImports()
          .importClause({}),
      }),
    ];
  }

  const result: IStructure<ts.ClassElement>[] = [];

  const importClause = [Object.identifier({ text: Context.config.entities.dto.hookName }).importSpecifier({})];

  const backImportClause: Array<{ key: string; node: IStructure<any> }> = [];
  const validKeys = Object.keys(Context.config.entities.dto.decorators);
  for (const key in UseCaseContext.dtoModel) {
    const field = UseCaseContext.dtoModel[key];

    for (const key in field) {
      const item = field[key as keyof typeof field];
      const imported = backImportClause.find((res) => res.key === key);
      if (!imported && validKeys.includes(key)) {
        const _key = key as keyof typeof Context.config.entities.dto.decorators;
        backImportClause.push({
          key,
          node: Object.identifier({ text: Context.config.entities.dto.decorators[_key] }).importSpecifier({}),
        });
      }

      if (typeof item === 'object') {
        if (item.source) {
          const named = item.id.endsWith('[]')
            ? item.id.substring(0, item.id.length - 2)
            : item.id.startsWith('Array')
              ? item.id.split('<')[1].substring(0, item.id.split('<')[1].length - 1)
              : item.id;

          result.push(
            Object.stringLiteral({ text: item.source }).importDeclaration({
              importClause: [Object.identifier({ text: named }).importSpecifier({})].namedImports().importClause({}),
            }),
          );
        }
      }
    }
  }
  importClause.push(...backImportClause.map((res) => res.node));

  result.unshift(
    Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
      importClause: importClause.namedImports().importClause({}),
    }),
  );

  return result;
}

// TODO: clean code
// eslint-disable-next-line complexity
function getDtoProperties() {
  if (!UseCaseContext.dtoModel) {
    return [
      Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertyDeclaration({
        modifiers: [Object.identifier({ text: Context.config.entities.dto.decorators.required }).callExpression({}).decorator(), Object.modifier.publicKeyword],
        type: Object.keywordTypeNode.typeNodeString,
      }),
    ];
  }

  const result: IStructure<ts.ClassElement>[] = [];

  for (const key in UseCaseContext.dtoModel) {
    const { required, default: dValue, originalKey, value } = UseCaseContext.dtoModel[key];

    const modifiers = [Object.modifier.publicKeyword];

    if (dValue) {
      modifiers.unshift(
        Object.identifier({ text: Context.config.entities.dto.decorators.default })
          .callExpression({ argumentsArray: [Object.identifier({ text: dValue })] })
          .decorator(),
      );
    }

    if (originalKey) {
      modifiers.unshift(
        Object.identifier({ text: Context.config.entities.dto.decorators.originalKey })
          .callExpression({ argumentsArray: [Object.stringLiteral({ text: originalKey })] })
          .decorator(),
      );
    }

    if (required) {
      modifiers.unshift(Object.identifier({ text: Context.config.entities.dto.decorators.required }).callExpression({}).decorator());
    }

    let type = Object.keywordTypeNode.typeNodeAny;

    if (value === 'string') {
      type = Object.keywordTypeNode.typeNodeString;
    } else if (value === 'boolean') {
      type = Object.keywordTypeNode.typeNodeBoolean;
    } else if (value === 'number') {
      type = Object.keywordTypeNode.typeNodeNumber;
    } else if (value.id.startsWith('Array')) {
      const _annotation = value.id.split('<')[1];
      const annotation = _annotation.substring(0, _annotation.length - 1);
      type = Object.identifier({ text: annotation }).typeReferenceNode({}).arrayTypeNode();
    } else if (value.id.endsWith('[]') && value.source) {
      const annotation = value.id.substring(0, value.id.length - 2);
      type = Object.identifier({ text: annotation }).typeReferenceNode({}).arrayTypeNode();
    } else if (value.id && value.source) {
      type = Object.identifier({ text: value.id }).typeReferenceNode({});
    }

    result.push(
      Object.identifier({ text: key }).propertyDeclaration({
        modifiers: modifiers,
        type: type,
      }),
    );
  }

  return result;
}
