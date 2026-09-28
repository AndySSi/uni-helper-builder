import ts from 'typescript';
import { DecoratorKeys, DtoFieldProp } from '../../../models';

/** Decode once, validate each record, then reuse the normal child DTO converter. */
export function getJsonEncodedList(prop: DtoFieldProp, dtoName: string): IStructure<ts.Expression> {
  const f = ts.factory;
  const id = f.createIdentifier;
  const field = dtoName + '.' + prop.field;
  const call = (name: ts.Expression, args: ts.Expression[]) => f.createCallExpression(name, undefined, args);
  const access = f.createPropertyAccessExpression;
  const binary = (left: ts.Expression, op: ts.BinaryOperator, right: ts.Expression) =>
    f.createBinaryExpression(left, op, right);
  const decoded = call(id(Context.config.dependencies.decodeJsonField?.hookName ?? 'decodeJsonField'), [
    f.createElementAccessExpression(
      id(Context.config.entities.dto.converts.fromId),
      f.createStringLiteral(prop.option[DecoratorKeys.originalKey] || prop.field),
    ),
    f.createStringLiteral(field),
    f.createStringLiteral('array'),
  ]);
  const values = f.createAsExpression(
    f.createParenthesizedExpression(
      binary(decoded, ts.SyntaxKind.QuestionQuestionToken, f.createArrayLiteralExpression()),
    ),
    f.createArrayTypeNode(f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)),
  );
  const invalid = binary(
    binary(
      binary(id('value'), ts.SyntaxKind.EqualsEqualsEqualsToken, f.createNull()),
      ts.SyntaxKind.BarBarToken,
      binary(
        f.createTypeOfExpression(id('value')),
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        f.createStringLiteral('object'),
      ),
    ),
    ts.SyntaxKind.BarBarToken,
    call(access(id('Array'), 'isArray'), [id('value')]),
  );
  const callback = f.createArrowFunction(
    undefined,
    undefined,
    [
      f.createParameterDeclaration(undefined, undefined, 'value'),
      f.createParameterDeclaration(undefined, undefined, 'index'),
    ],
    undefined,
    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    f.createBlock(
      [
        f.createIfStatement(
          invalid,
          f.createThrowStatement(
            f.createNewExpression(id('Error'), undefined, [
              binary(
                binary(f.createStringLiteral(field + '['), ts.SyntaxKind.PlusToken, id('index')),
                ts.SyntaxKind.PlusToken,
                f.createStringLiteral('] must be an object'),
              ),
            ]),
          ),
        ),
        f.createReturnStatement(
          call(access(id(prop.option[DecoratorKeys.default]!.source!), Context.config.entities.dto.override.fromJson), [
            id('value'),
          ]),
        ),
      ],
      true,
    ),
  );
  const result: IStructure<ts.Expression> = Object.identifier({ text: 'decoded' });
  (result as IStructure<ts.Expression> & { node: ts.Expression }).node = call(
    access(f.createParenthesizedExpression(values), 'map'),
    [callback],
  );
  return result;
}
