import ts from 'typescript';

import { DtoFieldProp, DtoFileInfo, DecoratorKeys } from '../../../../dto/models';
import { CustomImportOption } from '../models';
import { ORIGINAL_KEYS } from 'src/_constants';

const DEFAULT_SOURCE_SEPARATOR = '&&';

export function getImports(dto: DtoFileInfo, imports: IStructure<ts.ImportDeclaration>[] = [], dtoFields: DtoFieldProp[], specifiers: CustomImportOption[] = []) {
  /* dtoFields.reduce((prev, item) => {
    item.option[DecoratorKeys.required]
    item.option[DecoratorKeys.whenList]
    item.option[DecoratorKeys.whenMap]

    return prev;
  }, {}) */
  const importAssert = dtoFields.some((res) => res.option[DecoratorKeys.required]);
  const importValidArray = dtoFields.some((res) => res.option[DecoratorKeys.whenList]);
  const importValidObject = dtoFields.some((res) => res.option[DecoratorKeys.whenMap]);
  const importDependencies = [];

  if (importAssert) {
    importDependencies.push(Object.identifier({ text: Context.config.dependencies.assert.hookName }).importSpecifier({}));
  }

  if (importValidArray) {
    importDependencies.push(Object.identifier({ text: Context.config.dependencies.validArray.hookName }).importSpecifier({}));
  }

  if (importValidObject) {
    importDependencies.push(Object.identifier({ text: Context.config.dependencies.validObject.hookName }).importSpecifier({}));
  }

  if (dtoFields.some(prop => prop.option[DecoratorKeys.jsonEncoded])) {
    importDependencies.push(Object.identifier({
      text: Context.config.dependencies.decodeJsonField?.hookName ?? 'decodeJsonField',
    }).importSpecifier({}));
  }

  if (importDependencies.length) {
    imports.push(
      Object.stringLiteral({ text: Context.config.dependencyName }).importDeclaration({
        importClause: importDependencies.namedImports().importClause({}),
      }),
    );
  }

  imports.push(
    Object.stringLiteral({ text: dto.filepath.basename(ORIGINAL_KEYS.ts.suffix).padPrefix('./../') }).importDeclaration({
      importClause: [Object.identifier({ text: dto.dtoName }).importSpecifier({})].namedImports().importClause({}),
    }),
  );

  dtoFields.forEach((item) => {
    const mapSource = item.option[DecoratorKeys.default]?.source;
    if (mapSource) {
      const sources = typeof mapSource === 'string' ? [mapSource] : mapSource;
      sources.forEach((source) => {
        const [_source] = source.split(DEFAULT_SOURCE_SEPARATOR);
        const onceImport = specifiers.find((res) => res.specifier?.includes(_source));

        if (onceImport) {
          onceImport.secureSpecifier = onceImport.secureSpecifier ?? [];

          if (!onceImport.secureSpecifier.includes(_source)) onceImport.secureSpecifier.push(_source);
        }
      });
    }
  });

  specifiers.forEach((item) => {
    if (item.secureSpecifier?.length) {
      imports.push(
        Object.identifier({ text: item.source }).importDeclaration({
          importClause: item.secureSpecifier
            .map((res) => Object.identifier({ text: res }).importSpecifier({}))
            .namedImports()
            .importClause({}),
        }),
      );
    }
  });
}
