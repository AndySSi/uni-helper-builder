import ts from 'typescript';

import { configuration } from 'src/configuration';

import { ORIGINAL_KEYS, getDtoNamespace } from 'src/_constants';
import { BaseContext } from 'src/base';
import { DtoFileInfo } from './models';

export class DtoContext extends BaseContext {
  public static allDtoFiles: DtoFileInfo[];
  public static groupAllDto: Record<string, DtoFileInfo[]>;
  public static groupCurDto: Record<string, DtoFileInfo[]>;

  public static reset = setContext;
}

function setContext() {
  const heritages: DtoFileInfo[] = [];
  const dtoFiles: DtoFileInfo[] = Context.config.entities.dto.converts.matched.byFile({
    excludes: configuration.excludes,
    mapper(filename, dirname) {
      const filepath = [dirname, filename].toPath;

      const dtoName = getDtoNamespace(filepath.basename(Context.config.entities.dto.fileSuffix.padSuffix(ORIGINAL_KEYS.ts.suffix)).toHump().firstToUpper);

      const dto = <DtoFileInfo>{ filepath, dirname, dtoName, config: {} };

      formatter(dto, heritages);

      return dto;
    },
  });
  dtoFiles.forEach((dto) => {
    const item = heritages.find((heritage) => heritage.dtoName === dto.config.heritageName);

    if (item) {
      dto.config.heritageInfo = item;
    }
  });
  DtoContext.allDtoFiles = dtoFiles;
  const groupDtoFiles = dtoFiles.groupByKey('dirname');

  for (const dirname in groupDtoFiles) {
    padConvertInfo(groupDtoFiles[dirname]);
  }

  DtoContext.groupCurDto = DtoContext.groupAllDto = groupDtoFiles;
}

function formatter(dto: DtoFileInfo, heritages: DtoFileInfo[]) {
  dto.filepath.parseTsFile.forEachChild((node) => {
    if (ts.isClassDeclaration(node)) {
      dto.config.heritageName = getDtoHeritage(node);
      dto.config.abstract = getDtoAbstract(node);

      if (dto.config.abstract) {
        heritages.push(dto);
      }
    }
  });
}

function getDtoHeritage(node: ts.ClassDeclaration): string {
  return (node.heritageClauses && node.heritageClauses[0].types[0].getText()) || '';
}

function getDtoAbstract(node: ts.ClassDeclaration): boolean {
  if (node.modifiers) {
    return node.modifiers.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword);
  }

  return false;
}

function padConvertInfo(dtos: DtoFileInfo[]) {
  const root = [dtos[0].filepath.dirname(), Context.config.entities.dto.converts.dirname].toPath;
  const indexPath = [root, Context.config.entities.dto.converts.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath;

  dtos.forEach((res) => {
    const filename = res.dtoName.toLine().substring(1).padSuffix(Context.config.entities.dto.converts.dirname);

    res.convertInfo = {
      root: indexPath,
      rootDir: root,
      filename,
      filepath: [root, filename.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath,
    };
  });
}
