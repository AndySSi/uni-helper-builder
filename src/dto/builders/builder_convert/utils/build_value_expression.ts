import ts from 'typescript';
import { getJsonEncodedList } from './json_encoded_list';

import { ORIGINAL_KEYS } from 'src/_constants';

import { DecoratorKeys, DtoFieldProp } from '../../../models';

// eslint-disable-next-line complexity
export function getValueExpression(prop: DtoFieldProp, dtoName: string): IStructure<ts.Expression> {
  const { option, field } = prop;
  if (option[DecoratorKeys.jsonEncoded]) return getJsonEncodedList(prop, dtoName);

  if (option[DecoratorKeys.required]) {
    return getNormal(getJsonKey(prop));
  }

  if (option[DecoratorKeys.whenList]) {
    if (!option[DecoratorKeys.default]) return getOutlier(option[DecoratorKeys.whenList] || field);
    return getWhenList(prop);
  }

  if (option[DecoratorKeys.whenMap]) {
    if (!option[DecoratorKeys.default]) return getOutlier(option[DecoratorKeys.whenMap] || field);
    return getWhenMap(prop);
  }

  if (!option[DecoratorKeys.default]) return getOutlier(getJsonKey(prop));

  const tKind = option[DecoratorKeys.default]!.tKind;

  switch (tKind) {
    case ts.SyntaxKind.ArrayType:
      return getToList(prop);

    case ts.SyntaxKind.StringKeyword:
      return notProcessed(prop);

    case ts.SyntaxKind.NumberKeyword:
      return notProcessed(prop);

    case ts.SyntaxKind.BooleanKeyword:
      return notProcessed(prop);

    case ts.SyntaxKind.UnionType: {
      return notProcessed(prop);
    }
    case ts.SyntaxKind.TypeReference:
      return getThroughValue(prop);

    default:
      `Invalid ${ts.SyntaxKind[tKind]} ${getValueExpression.name}`.printError();
      return getOutlier(getJsonKey(prop));
  }
}

function getThroughValue(prop: DtoFieldProp): IStructure<ts.Expression> {
  const vKind = prop.option[DecoratorKeys.default]!.vKind;
  const jsonKey = getJsonKey(prop);

  switch (vKind) {
    case ts.SyntaxKind.PropertyAccessExpression:
      return getEnum(prop);

    case ts.SyntaxKind.Identifier:
      return getFromJson(prop);

    case ts.SyntaxKind.ArrayLiteralExpression:
      return getToList(prop);

    default:
      return getOutlier(jsonKey);
  }
}

const getJsonKey = (prop: DtoFieldProp) => prop.option[DecoratorKeys.originalKey] || prop.field;

const getOutlier = (key: string) =>
  Object.identifier({ text: Context.config.entities.dto.converts.fromId }).elementAccessExpression({
    index: Object.stringLiteral({ text: key }),
  });

const getNormal = (key: string) =>
  Object.identifier({ text: Context.config.entities.dto.converts.fromId }).elementAccessExpression({
    index: Object.stringLiteral({ text: key }),
  });

const getWhenList = (prop: DtoFieldProp, source: string = prop.option[DecoratorKeys.default]!.source!) =>
  Object.identifier({
    text: Context.config.dependencies.validArray.hookName,
  })
    .callExpression({
      argumentsArray: [
        Object.identifier({
          text: Context.config.entities.dto.converts.fromId,
        }).elementAccessExpression({ index: Object.stringLiteral({ text: prop.option[DecoratorKeys.whenList] || prop.field }) }),
      ],
    })
    .conditionalExpression({
      whenTrue: Object.identifier({
        text: Context.config.entities.dto.converts.fromId,
      })
        .elementAccessExpression({ index: Object.stringLiteral({ text: prop.option[DecoratorKeys.whenList] || prop.field }) })
        .propertyAccessExpression({
          name: ORIGINAL_KEYS.builtIn.map,
        })
        .callExpression({
          argumentsArray: [
            baseFromJson(source, [Object.identifier({ text: ORIGINAL_KEYS.arguments.value })]).arrowFunction({
              parameters: [Object.identifier({ text: ORIGINAL_KEYS.arguments.value }).parameterDeclaration({ type: Object.keywordTypeNode.typeNodeAny })],
            }),
          ],
        }),
      whenFalse: Object.identifier({
        text: ORIGINAL_KEYS.undefined,
      }),
    });

const getWhenMap = (prop: DtoFieldProp, source: string = prop.option[DecoratorKeys.default]!.source!) =>
  Object.identifier({
    text: Context.config.dependencies.validObject.hookName,
  })
    .callExpression({
      argumentsArray: [
        Object.identifier({
          text: Context.config.entities.dto.converts.fromId,
        }).elementAccessExpression({ index: Object.stringLiteral({ text: prop.option[DecoratorKeys.whenMap] || prop.field }) }),
      ],
    })
    .conditionalExpression({
      whenTrue: baseFromJson(source, [
        Object.identifier({ text: Context.config.entities.dto.converts.fromId }).elementAccessExpression({
          index: Object.stringLiteral({ text: prop.option[DecoratorKeys.whenMap] || prop.field }),
        }),
      ]),
      whenFalse: Object.identifier({
        text: ORIGINAL_KEYS.undefined,
      }),
    });

const getToList = (prop: DtoFieldProp, source: string = prop.option[DecoratorKeys.default]!.source!) =>
  Object.identifier({
    text: Context.config.entities.dto.converts.fromId,
  })
    .elementAccessExpression({ index: Object.stringLiteral({ text: getJsonKey(prop) }) })
    .binaryExpression({
      operator: ts.SyntaxKind.QuestionQuestionToken,
      right: [].arrayLiteralExpression({}),
    })
    .parenthesizedExpression()
    .propertyAccessExpression({
      name: ORIGINAL_KEYS.builtIn.map,
    })
    .callExpression({
      argumentsArray: [
        baseFromJson(source, [Object.identifier({ text: ORIGINAL_KEYS.arguments.value })]).arrowFunction({
          parameters: [Object.identifier({ text: ORIGINAL_KEYS.arguments.value }).parameterDeclaration({ type: Object.keywordTypeNode.typeNodeAny })],
        }),
      ],
    });

const getFromJson = (prop: DtoFieldProp, source: string = prop.option[DecoratorKeys.default]!.source!) =>
  prop.questionToken
    ? Object.identifier({
        text: Context.config.entities.dto.converts.fromId,
      })
        .elementAccessExpression({ index: Object.stringLiteral({ text: getJsonKey(prop) }) })
        .conditionalExpression({
          whenTrue: baseFromJson(source, [
            Object.identifier({ text: Context.config.entities.dto.converts.fromId }).elementAccessExpression({
              index: Object.stringLiteral({ text: getJsonKey(prop) }),
            }),
          ]),
          whenFalse: Object.identifier({
            text: ORIGINAL_KEYS.undefined,
          }),
        })
    : baseFromJson(source, [
        Object.identifier({ text: Context.config.entities.dto.converts.fromId }).elementAccessExpression({
          index: Object.stringLiteral({ text: getJsonKey(prop) }),
        }),
      ]);

const getEnum = (prop: DtoFieldProp, source: string = prop.option[DecoratorKeys.default]!.source!) =>
  Object.identifier({ text: source! })
    .propertyAccessExpression({ name: ORIGINAL_KEYS.builtIn.find })
    .callExpression({
      argumentsArray: [
        Object.identifier({ text: Context.config.entities.dto.converts.fromId }).elementAccessExpression({
          index: Object.stringLiteral({ text: getJsonKey(prop) }),
        }),
        Object.identifier({ text: prop.option[DecoratorKeys.default]!.value }),
      ],
    });

const baseFromJson = (source: string, argumentsArray: IStructure<ts.Expression>[]) =>
  Object.identifier({ text: source }).propertyAccessExpression({ name: Context.config.entities.dto.override.fromJson }).callExpression({ argumentsArray });

const notProcessed = (prop: DtoFieldProp, value: string = prop.option[DecoratorKeys.default]!.value) =>
  Object.identifier({ text: Context.config.entities.dto.converts.fromId })
    .elementAccessExpression({
      index: Object.stringLiteral({ text: getJsonKey(prop) }),
    })
    .binaryExpression({
      operator: ts.SyntaxKind.QuestionQuestionToken,
      right: Object.identifier({ text: value }),
    });
