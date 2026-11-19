import ts from 'typescript';

/** Options must be static so generation never evaluates application code. */
export function parseDefaultOptions(node: ts.Expression | undefined, field: string): boolean {
  if (!node) return false;
  const invalid = () => new Error(`${field}: @Default options must be { useDefaultWhenEmpty: true | false }`);
  if (!ts.isObjectLiteralExpression(node)) throw invalid();
  let enabled = false;
  let seen = false;
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)
      || !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
      || property.name.text !== 'useDefaultWhenEmpty' || seen
      || ![ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(property.initializer.kind)) {
      throw invalid();
    }
    seen = true;
    enabled = property.initializer.kind === ts.SyntaxKind.TrueKeyword;
  }
  return enabled;
}

export function isDefaultEmptyStringType(type: ts.TypeNode | undefined): boolean {
  if (!type) return false;
  if (ts.isParenthesizedTypeNode(type)) return isDefaultEmptyStringType(type.type);
  if (type.kind === ts.SyntaxKind.StringKeyword) return true;
  if (!ts.isUnionTypeNode(type)) return false;
  return type.types.some(isDefaultEmptyStringType) && type.types.every(member =>
    isDefaultEmptyStringType(member)
    || member.kind === ts.SyntaxKind.UndefinedKeyword
    || (ts.isLiteralTypeNode(member) && member.literal.kind === ts.SyntaxKind.NullKeyword));
}

export function createEmptyDefaultExpression(value: ts.Expression, fallback: ts.Expression): ts.Expression {
  const f = ts.factory;
  const binary = f.createBinaryExpression;
  return f.createConditionalExpression(
    binary(
      binary(value, ts.SyntaxKind.EqualsEqualsToken, f.createNull()),
      ts.SyntaxKind.BarBarToken,
      binary(
        binary(f.createTypeOfExpression(value), ts.SyntaxKind.EqualsEqualsEqualsToken, f.createStringLiteral('string')),
        ts.SyntaxKind.AmpersandAmpersandToken,
        binary(f.createCallExpression(f.createPropertyAccessExpression(value, 'trim'), undefined, []),
          ts.SyntaxKind.EqualsEqualsEqualsToken, f.createStringLiteral('')),
      ),
    ),
    f.createToken(ts.SyntaxKind.QuestionToken), fallback,
    f.createToken(ts.SyntaxKind.ColonToken), value,
  );
}
