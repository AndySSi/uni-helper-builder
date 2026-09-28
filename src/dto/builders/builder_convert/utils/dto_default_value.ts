import ts from 'typescript';

import { DtoFileInfo, MappedOption } from '../../../../dto/models';
import { ORIGINAL_KEYS } from 'src/_constants';

export function getDtoValidDefaultValue(value: ts.Expression, type: ts.TypeNode, dtoInfo: DtoFileInfo) {
  validCrossType(value, type, dtoInfo);

  if (
    [
      ts.SyntaxKind.ArrayType,
      ts.SyntaxKind.StringKeyword,
      ts.SyntaxKind.NumberKeyword,
      ts.SyntaxKind.BooleanKeyword,
      ts.SyntaxKind.TypeReference,
      ts.SyntaxKind.UnionType,
      ts.SyntaxKind.TupleType,
      ts.SyntaxKind.UndefinedKeyword,
      ts.SyntaxKind.LiteralType,
      // ts.SyntaxKind.AnyKeyword,
    ].includes(type.kind)
  ) {
    return { value: value.getText(), vKind: value.kind, tKind: type.kind, source: getTypeSource(value, type) } as MappedOption['Default'];
  }

  `Invalid ${type.getText()} ${value.parent.getText()} ${ts.SyntaxKind[type.kind]} ${getDtoValidDefaultValue.name}\nby: ${dtoInfo.filepath}`.printError(true);
}

function validCrossType(value: ts.Expression, type: ts.TypeNode, dtoInfo: DtoFileInfo) {
  const passed = crossTypeMapper(type.kind)(value.kind);

  if (passed === false) {
    const parent = (<any>type.parent)?.name as ts.Identifier;
    `Invalid ${ts.SyntaxKind[value.kind]} ${ts.SyntaxKind[type.kind]} ${validCrossType.name}\nby: ${dtoInfo.filepath}\nkey: ${parent?.text}`.printError(true);
  }

  return passed;
}

const crossTypeMapper = (tKind: ts.SyntaxKind) => {
  const result = crossTypeMappers[tKind];

  return result ?? (() => false);
};

const validStringType = [ts.SyntaxKind.StringLiteral];
const validLiteralType = [ts.SyntaxKind.NullKeyword, ts.SyntaxKind.Identifier];
const validNumericType = [ts.SyntaxKind.NumericLiteral, ts.SyntaxKind.PrefixUnaryExpression];
const validBooleanType = [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword];
const validArrayType = [ts.SyntaxKind.ArrayLiteralExpression];
const validTypeReferenceType = [ts.SyntaxKind.Identifier, ts.SyntaxKind.PropertyAccessExpression, ts.SyntaxKind.ArrayLiteralExpression];
const validUnionType = [...validStringType, ...validNumericType, ...validBooleanType, ...validTypeReferenceType, ...validArrayType, ...validLiteralType];

const crossTypeMappers = <Record<ts.SyntaxKind, (vKind: ts.SyntaxKind) => boolean>>{
  [ts.SyntaxKind.StringKeyword]: (vKind) => validStringType.includes(vKind),
  [ts.SyntaxKind.NumberKeyword]: (vKind) => validNumericType.includes(vKind),
  [ts.SyntaxKind.BooleanKeyword]: (vKind) => validBooleanType.includes(vKind),
  [ts.SyntaxKind.UnionType]: (vKind) => validUnionType.includes(vKind),
  [ts.SyntaxKind.TypeReference]: (vKind) => validTypeReferenceType.includes(vKind),
  [ts.SyntaxKind.ArrayType]: (vKind) => validArrayType.includes(vKind),
};

function getTypeSource(value: ts.Expression, type: ts.TypeNode): string /* | string[] */ | undefined {
  return typeSourceMapper(type.kind)(value, type);
}

const typeSourceMapper = (tKind: ts.SyntaxKind) => {
  const result = typeSourceMappers[tKind];

  return result ?? ((value, type) => `Invalid ${type.getText()} ${value.parent.getText()} ${ts.SyntaxKind[type.kind]} ${getTypeSource.name}`.printError(true));
};

const typeSourceMappers = <Record<ts.SyntaxKind, (value: ts.Expression, type: ts.TypeNode) => string | undefined>>{
  [ts.SyntaxKind.StringKeyword]: (value, type) => undefined,
  [ts.SyntaxKind.NumberKeyword]: (value, type) => undefined,
  [ts.SyntaxKind.BooleanKeyword]: (value, type) => undefined,
  [ts.SyntaxKind.LiteralType]: (value, type) => {
    const literal = (<ts.LiteralTypeNode>type).literal;

    if (literal.kind === ts.SyntaxKind.NullKeyword) {
      return (<ts.NullLiteral>literal).getText();
    }

    return undefined;
  },
  [ts.SyntaxKind.UnionType]: (value, type) => undefined,
  [ts.SyntaxKind.ArrayType]: (value, type) => {
    const element = (type as ts.ArrayTypeNode).elementType;
    return ts.isTypeReferenceNode(element) ? element.typeName.getText() : undefined;
  },
  [ts.SyntaxKind.TypeReference]: (value, type: ts.TypeReferenceNode) => {
    if (!type.typeArguments) return type.typeName.getText();

    if (type.typeName.getText() === ORIGINAL_KEYS.array) return type.typeArguments[0].getText();

    return undefined;
  },
};
