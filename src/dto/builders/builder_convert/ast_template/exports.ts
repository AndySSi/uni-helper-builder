import ts from 'typescript';

import { ORIGINAL_KEYS } from 'src/_constants';
import { DtoFileInfo } from '../../../models';
import { getFromJsonName, getToListName } from '../utils';

export const exportFromJsonAst = (funcName: string, dto: DtoFileInfo) =>
  [
    Object.identifier({ text: funcName })
      .propertyAccessExpression({ name: ORIGINAL_KEYS.bind })
      .callExpression({ argumentsArray: [Object.identifier({ text: dto.dtoName })] })
      .arrowFunction({})
      .variableDeclaration({ name: getFromJsonName(dto), type: Object.identifier({ text: funcName }).typeQueryNode({}).functionTypeNode({}) }),
  ]
    .variableDeclarationList({ flags: ts.NodeFlags.Const })
    .variableStatement({ modifiers: [Object.modifier.exportKeyword] });

export const exportToListAst = (funcName: string, dto: DtoFileInfo) =>
  [
    Object.identifier({ text: Context.config.entities.dto.converts.fromId })
      .binaryExpression({
        operator: ts.SyntaxKind.QuestionQuestionToken,
        right: [].arrayLiteralExpression({}),
      })
      .parenthesizedExpression()
      .propertyAccessExpression({ name: ORIGINAL_KEYS.builtIn.map })
      .callExpression({
        typeArguments: [Object.identifier({ text: dto.dtoName }).typeReferenceNode({})],
        argumentsArray: [
          Object.identifier({ text: funcName })
            .propertyAccessExpression({ name: ORIGINAL_KEYS.call })
            .callExpression({
              argumentsArray: [Object.identifier({ text: dto.dtoName }), Object.identifier({ text: ORIGINAL_KEYS.arguments.value })],
            })
            .arrowFunction({
              parameters: [Object.identifier({ text: ORIGINAL_KEYS.arguments.value }).parameterDeclaration({})],
            }),
        ],
      })
      .arrowFunction({
        parameters: [
          Object.identifier({
            text: Context.config.entities.dto.converts.fromId,
          }).parameterDeclaration({ type: Object.keywordTypeNode.typeNodeAny.arrayTypeNode() }),
        ],
      })
      .variableDeclaration({ name: getToListName(dto) }),
  ]
    .variableDeclarationList({ flags: ts.NodeFlags.Const })
    .variableStatement({ modifiers: [Object.modifier.exportKeyword] });
