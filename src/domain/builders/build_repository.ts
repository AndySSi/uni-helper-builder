import ts from 'typescript';

import { ORIGINAL_KEYS } from 'src/_constants';

import { DomainCreateTemplate } from '../models';
import { DomainRuntime } from '../context';
import { buildImports } from '../ast_template';

export async function buildRepository() {
  return RepositoryStrategy[DomainRuntime.createType]();
}

class RepositoryStrategy {
  static [DomainCreateTemplate.empty] = () =>
    withBuilder(async () => {
      const { repository, sourceName, target } = DomainRuntime.namespace;

      const root = [target, Context.config.repository.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;

      const imports = [
        [Context.config.dependencyName, [Context.config.repository.hookName]],
        [Context.config.repository.httpApi.entry, Context.config.repository.httpApi.hookName],
      ];

      if (Array.isArray(Context.config.repository.enableSingleton)) {
        if (Context.config.repository.enableSingleton[0] === Context.config.dependencyName) {
          (<any>imports[0][1]).push(Context.config.repository.enableSingleton[1]);
        } else {
          imports.push(Context.config.repository.enableSingleton);
        }
      }

      const indexCode = [
        ...buildImports(<any>imports),

        [
          [
            Object.super()
              .callExpression({
                argumentsArray: [Object.identifier({ text: Context.config.repository.httpApi.hookName }), Object.stringLiteral({ text: sourceName })],
              })
              .expressionStatement(),
          ]
            .block({})
            .constructorDeclaration({}),
        ].classDeclaration({
          modifiers: Context.config.repository.enableSingleton === false ? [Object.modifier.exportKeyword] : undefined,
          name: Array.isArray(Context.config.repository.enableSingleton) ? repository.padPrefix('_') : repository,
          heritageClauses: [[Object.identifier({ text: Context.config.repository.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
        }),

        Context.config.repository.enableSingleton !== false
          ? [
              Array.isArray(Context.config.repository.enableSingleton)
                ? Object.identifier({ text: Context.config.dependencies.createSingleton.hookName })
                    .callExpression({ argumentsArray: [Object.identifier({ text: repository.padPrefix('_') })] })
                    .variableDeclaration({ name: Object.identifier({ text: repository }) })
                : Object.identifier({ text: repository })
                    .newExpression({})
                    .variableDeclaration({ name: Object.identifier({ text: repository.firstToLower }) }),
            ]
              .variableDeclarationList({ flags: ts.NodeFlags.Const })
              .variableStatement({ modifiers: [Object.modifier.exportKeyword] })
          : undefined,
      ].toStructure();

      return { root: null, codes: [[root, indexCode]] };
    });
}
