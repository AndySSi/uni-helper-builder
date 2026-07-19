import { ORIGINAL_KEYS } from 'src/_constants';
import { DecoratorKeys, DtoFieldProp } from '../../../models';

export const assertAst = (assertKeys: DtoFieldProp[]) =>
  Object.identifier({ text: Context.config.dependencies.assert.hookName })
    .propertyAccessExpression({ name: ORIGINAL_KEYS.call })
    .callExpression({
      argumentsArray: [
        Object.this(),
        Object.identifier({ text: Context.config.entities.dto.converts.fromId }),
        ...assertKeys.map((res) => Object.stringLiteral({ text: res.option[DecoratorKeys.originalKey] ?? res.field })),
      ],
    })
    .expressionStatement();
