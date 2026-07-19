import ts from 'typescript';

import { ORIGINAL_KEYS } from 'src/_constants';
import { DomainCreateTemplate } from '../models';
import { DomainRuntime } from '../context';
import { buildImports } from '../ast_template';

export async function buildIndex() {
  return IndexBuildFactory[DomainRuntime.createType]();
}

class IndexBuildFactory {
  static [DomainCreateTemplate.empty] = () =>
    withBuilder(async () => {
      const { aggregateRoot, domain, target } = DomainRuntime.namespace;

      const root = [target, Context.config.domain.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;

      const indexCode = [
        ...buildImports([
          [Context.config.dependencyName, Context.config.domain.hookName],
          [Context.config.useCase.dirname.padPrefix('./'), aggregateRoot],
        ]),

        Object.stringLiteral({ text: Context.config.entities.dirname.padPrefix('./') }).exportDeclaration({}),
        Object.stringLiteral({ text: Context.config.requestParams.dirname.padPrefix('./') }).exportDeclaration({}),

        [
          Object.identifier({ text: Context.config.domain.casesKey }).propertyDeclaration({
            modifiers: [Object.modifier.staticKeyword, Object.modifier.readonlyKeyword],
            initializer: Object.identifier({ text: aggregateRoot }).newExpression({}),
          }),
        ].classDeclaration({
          modifiers: [Object.modifier.exportKeyword],
          name: domain,
          heritageClauses: [[Object.identifier({ text: Context.config.domain.hookName }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword })],
        }),
      ].toStructure();

      return { root: null, codes: [[root, indexCode]] };
    });
}
