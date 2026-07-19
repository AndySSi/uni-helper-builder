import ts from 'typescript';

import { DtoFieldProp, DtoFileInfo, DecoratorKeys } from '../../../../dto/models';
import { CustomImportOption } from '../models';
import { padPath } from './pad_path';
import { getDtoValidDefaultValue } from './dto_default_value';

export function getBuildInfo(dto: DtoFileInfo, entityModifiers: string[], dtoFields: DtoFieldProp[], specifiers: CustomImportOption[]) {
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
  [DecoratorKeys.required](prop: DtoFieldProp, value: ts.Expression, type: ts.TypeNode | undefined, dtoInfo: DtoFileInfo) {
    prop.option[DecoratorKeys.required] = true;
  },
  [DecoratorKeys.originalKey](prop: DtoFieldProp, value: ts.Expression, type: ts.TypeNode | undefined, dtoInfo: DtoFileInfo) {
    if (value!.kind !== ts.SyntaxKind.StringLiteral) {
      `Original key type invalid ${value!.parent.getText()}`.printError(true);
    }
    prop.option[DecoratorKeys.originalKey] = (value as ts.StringLiteral).text;
  },
  [DecoratorKeys.default](prop: DtoFieldProp, value: ts.Expression, type: ts.TypeNode | undefined, dtoInfo: DtoFileInfo) {
    if (!type) {
      `key type is required ${prop.field}`.printError(true);
    }
    prop.option[DecoratorKeys.default] = getDtoValidDefaultValue(value!, type!, dtoInfo!);
  },
  [DecoratorKeys.whenList](prop: DtoFieldProp, value: ts.Expression, type: ts.TypeNode | undefined, dtoInfo: DtoFileInfo) {
    prop.option[DecoratorKeys.whenList] = (value as ts.StringLiteral).text;
  },
  [DecoratorKeys.whenMap](prop: DtoFieldProp, value: ts.Expression, type: ts.TypeNode | undefined, dtoInfo: DtoFileInfo) {
    prop.option[DecoratorKeys.whenMap] = (value as ts.StringLiteral).text;
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
      const decoratorKey = res.expression.expression.getText() as DecoratorKeys;
      const decoratorValue = res.expression.arguments[0];
      const decoratorType = item.type;

      decoratorKeyMapper[decoratorKey](prop, decoratorValue, decoratorType, dtoInfo);
    });
    dtoFields.push(prop);
  });

  return dtoFields;
}

function isValidDtoProperty(item: ts.ClassElement): item is ts.PropertyDeclaration {
  return Boolean(ts.isPropertyDeclaration(item) && item.modifiers?.length && item.modifiers.some((res) => ts.isDecorator(res)));
}
