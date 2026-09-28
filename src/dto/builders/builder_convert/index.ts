import ts from 'typescript';
import * as bt from '@babel/types';
import generate from '@babel/generator';

import { I_FILE_SPACED, I_FILE_SPACED_AST, ORIGINAL_KEYS } from 'src/_constants';
import { isDtoClass } from 'src/utils';

import { DecoratorKeys, DtoFieldProp, DtoFileInfo } from '../../models';
import { CustomImportOption } from './models';
import { getBuildInfo } from './utils/build_info';
import { getImports } from './utils/dto_imports';
import { assertAst, assignmentAst, exportFromJsonAst, exportToListAst } from './ast_template';
import { getFromJsonName, getToListName } from './utils';

export class BuilderConvert {
  static async build(currentDtos: DtoFileInfo[], allDtos: DtoFileInfo[]) {
    const root = [currentDtos[0].filepath.dirname(), Context.config.entities.dto.converts.dirname].toPath;
    const indexPath = [root, Context.config.entities.dto.converts.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;

    const builders = await currentDtos.forAwait(buildConverts);

    const code = await allDtos
      .reduce<
        IStructure<any>[]
      >((prev, item) => (!item.config.abstract ? (prev.push(Object.stringLiteral({ text: item.convertInfo!.filename.padPrefix('./') }).exportDeclaration({})), prev) : prev), [])
      .toStructure().formatter;

    const buildIndex = () => {
      indexPath.rewrite(code);
    };

    const buildIndexBefore = () => {
      root.makeDir();
    };

    if (builders.filter(Boolean).length) {
      builders.unshift(buildIndexBefore);
      builders.push(buildIndex);
    }

    return builders;
  }
}

async function buildConverts(dto: DtoFileInfo) {
  if (dto.config.abstract) {
    return;
  }

  const specifiers: CustomImportOption[] = [];
  const entityModifiers: string[] = [];
  const dtoFields: DtoFieldProp[] = [];
  const imports: IStructure<ts.ImportDeclaration>[] = [];

  getBuildInfo(dto, entityModifiers, dtoFields, specifiers);
  getImports(dto, imports, dtoFields, specifiers);
  const dtoCode = await buildDtos(dto, entityModifiers);

  const asserts = dtoFields.filter((res) => res.option[DecoratorKeys.required]);

  const funcHeads: IStructure<ts.Statement>[] = [];
  const funcName = dto.dtoName.padPrefix('__$').padSuffix('Convert');

  if (asserts.length) {
    funcHeads.push(assertAst(asserts));
  }

  const assignments: IStructure<ts.Statement>[] = [];

  dtoFields.forEach((prop) => {
    assignments.push(assignmentAst(prop, dto.dtoName));
  });

  const exports = [exportFromJsonAst(funcName, dto)];

  if (entityModifiers.includes(Context.config.entities.dto.decorators.list)) {
    exports.push(exportToListAst(funcName, dto));
  }

  const returned = [Object.identifier({ text: Context.config.entities.dto.converts.resultId }).returnStatement()];

  if (entityModifiers.includes(Context.config.entities.dto.decorators.freeze)) {
    returned.pop();
    returned.push(
      Object.identifier({ text: ORIGINAL_KEYS.object })
        .propertyAccessExpression({ name: ORIGINAL_KEYS.builtIn.freeze })
        .callExpression({
          typeArguments: [Object.identifier({ text: dto.dtoName }).typeReferenceNode({})],
          argumentsArray: [Object.identifier({ text: Context.config.entities.dto.converts.resultId })],
        })
        .returnStatement(),
    );
  }

  const code = await [
    ...imports,

    [
      Object.identifier({ text: Context.config.entities.dto.converts.fromId })
        .binaryExpression({
          operator: ts.SyntaxKind.QuestionQuestionEqualsToken,
          right: [].objectLiteralExpression({}),
        })
        .expressionStatement(),

      ...funcHeads,

      [Object.this().newExpression({}).variableDeclaration({ name: Context.config.entities.dto.converts.resultId })].variableDeclarationList({ flags: ts.NodeFlags.Const }).variableStatement({}),

      ...assignments,

      ...returned,
    ]
      .block({})
      .functionDeclaration({
        name: funcName,
        parameters: [
          Object.identifier({ text: ORIGINAL_KEYS.this }).parameterDeclaration({ type: Object.identifier({ text: dto.dtoName }).typeQueryNode({}) }),
          Object.identifier({ text: Context.config.entities.dto.converts.fromId }).parameterDeclaration({
            type: Object.identifier({ text: ORIGINAL_KEYS.ts.record }).typeReferenceNode({
              typeArguments: [Object.identifier({ text: ORIGINAL_KEYS.ts.string }).typeReferenceNode({}), Object.keywordTypeNode.typeNodeAny],
            }),
          }),
        ],
      }),

    ...exports,
  ].toStructure().formatter;

  return () => {
    dto.convertInfo!.filepath.rewrite(code);
    dtoCode && dto.filepath.rewrite(dtoCode, { remove: false });
    dto.convertInfo!.filepath.printSuccess('Created');
  };
}

async function buildDtos(dto: DtoFileInfo, modifiers: string[]) {
  if (dto.config.abstract) return;

  const hasToList = modifiers.some((res) => res.includes(Context.config.entities.dto.decorators.list));

  const imports: bt.ImportDeclaration[] = [];

  const ast = dto.filepath.visitForBabel({
    enter(path) {
      if (bt.isImportDeclaration(path.node)) {
        imports.push(path.node);
        path.remove();
      }

      if (isDtoClass(path.node)) {
        path.insertBefore(I_FILE_SPACED_AST);
        if (bt.isIdentifier(path.node.id)) {
          path.node.id.name = dto.dtoName;
        }

        const fields = path.node.body.body;

        const index = fields.findIndex((node) => bt.isClassMethod(node) && bt.isIdentifier(node.key) && node.key.name.includes(Context.config.entities.dto.override.fromJson));

        if (index === -1) {
          fields.push(createFromJsonMethod(getFromJsonName(dto)));
        } else {
          fields.splice(index, 1, createFromJsonMethod(getFromJsonName(dto)));
        }

        if (hasToList) {
          const index = fields.findIndex((node) => bt.isClassMethod(node) && bt.isIdentifier(node.key) && node.key.name.includes(Context.config.entities.dto.override.toList));

          if (index === -1) {
            fields.push(createToListMethod(getToListName(dto)));
          } else {
            fields.splice(index, 1, createToListMethod(getToListName(dto)));
          }
        }
      }

      if (bt.isClassProperty(path.node)) {
        path.insertBefore(I_FILE_SPACED_AST);
        path.insertAfter(I_FILE_SPACED_AST);
      }

      if (bt.isClassMethod(path.node)) {
        path.insertBefore(I_FILE_SPACED_AST);
        path.insertAfter(I_FILE_SPACED_AST);
      }

      if (isDtoClass(path.node)) {
        path.insertBefore(I_FILE_SPACED_AST);
        path.insertAfter(I_FILE_SPACED_AST);
      }
    },
  });

  const index = imports.findIndex((res) => res.source.value.includes(Context.config.entities.dto.converts.dirname));

  const padCode: bt.ImportDeclaration = bt.importDeclaration(
    hasToList
      ? [bt.importSpecifier(bt.identifier(getFromJsonName(dto)), bt.identifier(getFromJsonName(dto))), bt.importSpecifier(bt.identifier(getToListName(dto)), bt.identifier(getToListName(dto)))]
      : [bt.importSpecifier(bt.identifier(getFromJsonName(dto)), bt.identifier(getFromJsonName(dto)))],
    bt.stringLiteral(Context.config.entities.dto.converts.dirname.padPrefix('./')),
  );

  if (index !== -1) {
    imports.splice(index, 1, padCode);
  } else {
    imports.push(padCode);
  }

  ast.program.body.unshift(...imports);

  return await generate(ast).code.replaceAll(I_FILE_SPACED, '\n').formatter;
}

const createFromJsonMethod = (name: string) =>
  bt.classMethod('get', bt.identifier(Context.config.entities.dto.override.fromJson), [], bt.blockStatement([bt.returnStatement(bt.callExpression(bt.identifier(name), []))]), undefined, true);

const createToListMethod = (name: string) =>
  bt.classMethod('get', bt.identifier(Context.config.entities.dto.override.toList), [], bt.blockStatement([bt.returnStatement(bt.identifier(name))]), undefined, true);
