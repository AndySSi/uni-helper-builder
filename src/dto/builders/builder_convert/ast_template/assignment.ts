import ts from 'typescript';

import { DtoFieldProp } from '../../../models';

import { getValueExpression } from '../utils/build_value_expression';

export const assignmentAst = (prop: DtoFieldProp, dtoName: string) =>
  Object.identifier({ text: Context.config.entities.dto.converts.resultId })
    .elementAccessExpression({ index: Object.stringLiteral({ text: prop.field }) })
    .binaryExpression({
      operator: ts.SyntaxKind.EqualsToken,
      right: getValueExpression(prop, dtoName),
    })
    .expressionStatement();
