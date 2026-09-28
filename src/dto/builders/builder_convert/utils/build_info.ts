import ts from 'typescript';

import { DtoFieldProp, DtoFileInfo, DecoratorKeys } from '../../../../dto/models';
import { CustomImportOption } from '../models';
import { padPath } from './pad_path';
import { getDtoValidDefaultValue } from './dto_default_value';

export function getBuildInfo(
  dto: DtoFileInfo,
  entityModifiers: string[],
  dtoFields: DtoFieldProp[],
  specifiers: CustomImportOption[],
) {
  dto.filepath.parseTsFile.forEachChild((node) => {
    if (ts.isImportDeclaration(node)) {
      let specifier: string[] | undefined;

      node.importClause?.namedBindings?.getChildren().map((res) => {
        if (res.kind === ts.SyntaxKind.SyntaxList) {
          specifier = res.getText().split(', ');
        }
      });

      specifiers.push({
        specifier: specifier,
        source: padPath(node.moduleSpecifier.getText()),
      });
    }

    if (ts.isClassDeclaration(node)) {
      entityModifiers.push(...getDtoEntityModifiers(node));

      dtoFields.push(...getDtoEntityField(node, dto));
    }
  });

  if (dto.config.heritageInfo) {
    getBuildInfo(dto.config.heritageInfo, entityModifiers, dtoFields, specifiers);
  }
}

function getDtoEntityModifiers(node: ts.ClassDeclaration) {
  const result: string[] = [];

  if (node.modifiers) {
    node.modifiers.forEach((res) => {
      if (ts.isDecorator(res)) {
        result.push(res.expression.getText());
      }
    });
  }

  return result;
}

const decoratorKeyMapper = {
  [DecoratorKeys.required](
    prop: DtoFieldProp,
    value: ts.Expression,
    type: ts.TypeNode | undefined,
    dtoInfo: DtoFileInfo,
  ) {
    prop.option[DecoratorKeys.required] = true;
  },
  [DecoratorKeys.originalKey](
    prop: DtoFieldProp,
    value: ts.Expression,
    type: ts.TypeNode | undefined,
    dtoInfo: DtoFileInfo,
  ) {
    if (value!.kind !== ts.SyntaxKind.StringLiteral) {
      `Original key type invalid ${value!.parent.getText()}`.printError(true);
    }
    prop.option[DecoratorKeys.originalKey] = (value as ts.StringLiteral).text;
  },
  [DecoratorKeys.default](
    prop: DtoFieldProp,
    value: ts.Expression,
    type: ts.TypeNode | undefined,
    dtoInfo: DtoFileInfo,
  ) {
    if (!type) {
      `key type is required ${prop.field}`.printError(true);
    }
    prop.option[DecoratorKeys.default] = getDtoValidDefaultValue(value!, type!, dtoInfo!);
  },
  [DecoratorKeys.whenList](
    prop: DtoFieldProp,
    value: ts.Expression,
    type: ts.TypeNode | undefined,
    dtoInfo: DtoFileInfo,
  ) {
    prop.option[DecoratorKeys.whenList] = (value as ts.StringLiteral).text;
  },
  [DecoratorKeys.whenMap](
    prop: DtoFieldProp,
    value: ts.Expression,
    type: ts.TypeNode | undefined,
    dtoInfo: DtoFileInfo,
  ) {
    prop.option[DecoratorKeys.whenMap] = (value as ts.StringLiteral).text;
  },
  [DecoratorKeys.jsonEncoded](prop: DtoFieldProp) {
    prop.option[DecoratorKeys.jsonEncoded] = true;
  },
};

function getDtoEntityField(node: ts.ClassDeclaration, dtoInfo: DtoFileInfo) {
  const dtoFields: DtoFieldProp[] = [];

  node.members.forEach((item) => {
    if (!isValidDtoProperty(item)) return;

    const prop: DtoFieldProp = { option: {} } as DtoFieldProp;

    item.modifiers!.forEach((res) => {
      if (!ts.isDecorator(res) || !ts.isCallExpression(res.expression)) return;

      prop.field = item.name.getText();
      prop.questionToken = Boolean(item.questionToken);
      const decoratorValue = res.expression.arguments[0];
      const decoratorType = item.type;

      /** 以下旧代码注释于2026年9月27日 */
      // const decoratorKey = res.expression.expression.getText() as DecoratorKeys;
      // decoratorKeyMapper[decoratorKey](prop, decoratorValue, decoratorType, dtoInfo);
      /** 旧代码结束 */

      /** 以下代码新增于2026年9月27日 with help of codex */
      const rawName = res.expression.expression.getText();
      const decoratorKey =
        rawName === (Context.config.entities.dto.decorators.jsonEncoded ?? 'JsonEncoded')
          ? DecoratorKeys.jsonEncoded
          : (rawName as DecoratorKeys);
      const handler = decoratorKeyMapper[decoratorKey];
      if (!handler) {
        throw new Error(`不支持的 DTO 字段装饰器：${dtoInfo.dtoName}.${prop.field} @${rawName}`);
      }
      handler(prop, decoratorValue, decoratorType, dtoInfo);
      /** 新代码结束 */
    });
    if (prop.option[DecoratorKeys.jsonEncoded]) {
      const type = item.type;
      const element = type && ts.isArrayTypeNode(type) ? type.elementType
        : type && ts.isTypeReferenceNode(type) && type.typeName.getText() === 'Array' && type.typeArguments?.length === 1
          ? type.typeArguments[0] : undefined;
      const fallback = prop.option[DecoratorKeys.default];
      if (!element || !ts.isTypeReferenceNode(element) || element.typeArguments?.length
        || !ts.isIdentifier(element.typeName) || !element.typeName.text.endsWith('Dto')
        || fallback?.value.replace(/\s/g, '') !== '[]' || prop.questionToken
        || prop.option[DecoratorKeys.required] || prop.option[DecoratorKeys.whenList] || prop.option[DecoratorKeys.whenMap]) {
        throw new Error(dtoInfo.dtoName + '.' + prop.field + ': @JsonEncoded requires a non-optional DTO array with @Default([]), without Required/WhenList/WhenMap');
      }
    }
    dtoFields.push(prop);
  });

  return dtoFields;
}

function isValidDtoProperty(item: ts.ClassElement): item is ts.PropertyDeclaration {
  return Boolean(
    ts.isPropertyDeclaration(item) && item.modifiers?.length && item.modifiers.some((res) => ts.isDecorator(res)),
  );
}
