import { UseCaseContext } from '../context';
import { HttpMethods } from '../models';

export const requestParamsAst = () => [
  Object.this()
    .propertyAccessExpression({ name: Context.config.repository.override.pathBuilder.hookName })
    .propertyAccessExpression({ name: Context.config.repository.override.pathBuilder.override.resolve })
    .callExpression({
      argumentsArray: [Object.stringLiteral({ text: UseCaseContext.sourceName.toLine().split('_').join('/') })],
    })
    .propertyAssignment({ name: Context.config.repository.httpApi.properties.url }),

  Object.identifier({ text: Context.config.dependencies.httpRequestMethod.hookName })
    .propertyAccessExpression({ name: HttpMethods[UseCaseContext.methodType].toLocaleUpperCase() })
    .propertyAssignment({ name: Context.config.repository.httpApi.properties.method }),
];
