import ts from 'typescript';
import generate from '@babel/generator';

import { DEPENDENCIES_INFO, ORIGINAL_KEYS } from 'src/_constants';
import { HttpMethods, UseCaseType } from '../models';
import { UseCaseContext } from '../context';

export const buildRequestParams = () =>
  withBuilder(async () => {
    const namespace = UseCaseContext.requestParams;
    namespace.rootPath.readDir();

    const code = await BuildByMethodType[UseCaseContext.methodType]();

    const indexPath = [namespace.rootPath, Context.config.requestParams.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;
    const exportedCode = [Object.stringLiteral({ text: namespace.filename.padPrefix('./') }).exportDeclaration({})].toStructure();

    const ast = indexPath.toUtf8Code.parseBabel;

    ast.program.body.push(exportedCode.parseBabel.program.body[0]);

    const indexData = generate(ast).code;

    return {
      root: null,
      codes: [
        [namespace.filepath, code],
        [indexPath, indexData],
      ],
    };
  });

class BuildByMethodType {
  static async [HttpMethods.get]() {
    return await BuildByGetCaseType[UseCaseContext.caseType]();
  }
  static async [HttpMethods.post]() {
    const namespace = UseCaseContext.requestParams;

    const code = [
      [Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertySignature({ type: Object.keywordTypeNode.typeNodeString })].interfaceDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.annotationName,
      }),
    ].toStructure();

    return code;
  }
  static async [HttpMethods.put]() {
    const namespace = UseCaseContext.requestParams;

    const code = [
      [Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertySignature({ type: Object.keywordTypeNode.typeNodeString })].interfaceDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.annotationName,
      }),
    ].toStructure();

    return code;
  }
  static async [HttpMethods.delete]() {
    const namespace = UseCaseContext.requestParams;

    const code = [
      [Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertySignature({ type: Object.keywordTypeNode.typeNodeString })].interfaceDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.annotationName,
      }),
    ].toStructure();

    return code;
  }
}

class BuildByGetCaseType {
  static async [UseCaseType.basic]() {
    const namespace = UseCaseContext.requestParams;

    const code = [
      [Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertySignature({ type: Object.keywordTypeNode.typeNodeString })].interfaceDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.annotationName,
      }),
    ].toStructure();

    return code;
  }

  static async [UseCaseType.module]() {
    const namespace = UseCaseContext.requestParams;

    const code = [
      [Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertySignature({ type: Object.keywordTypeNode.typeNodeString })].interfaceDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.annotationName,
      }),
    ].toStructure();

    return code;
  }

  static async [UseCaseType.paginator]() {
    const namespace = UseCaseContext.requestParams;

    const code = [
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: [Object.identifier({ text: Context.config.useCase.models.paginator.annotation.pagedQueryParams }).importSpecifier({})].namedImports().importClause({
          isTypeOnly: true,
        }),
      }),

      [Object.identifier({ text: DEPENDENCIES_INFO.project.id }).propertySignature({ type: Object.keywordTypeNode.typeNodeString })].interfaceDeclaration({
        modifiers: [Object.modifier.exportKeyword],
        name: namespace.annotationName,
        heritageClauses: [
          [Object.identifier({ text: Context.config.useCase.models.paginator.annotation.pagedQueryParams }).expressionWithTypeArguments({})].heritageClause({ token: ts.SyntaxKind.ExtendsKeyword }),
        ],
      }),
    ].toStructure();

    return code;
  }
}
