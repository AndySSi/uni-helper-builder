import type { DtoFileInfo } from '../models';

import traverse from '@babel/traverse';
import * as bt from '@babel/types';
import generate from '@babel/generator';

import { isDtoClass } from 'src/utils';
import { I_FILE_SPACED, I_FILE_SPACED_AST } from 'src/_constants';
import { DtoContext } from '../context';

export async function clearDto() {
  let handlers: ((() => void) | undefined)[] = [];

  for (const dirname in DtoContext.groupCurDto) {
    const isClearAll = Object.equal(DtoContext.groupAllDto[dirname].length, DtoContext.groupCurDto[dirname].length);

    handlers = handlers.concat(await DtoContext.groupCurDto[dirname].forAwait(clearDtoItem));

    if (isClearAll) {
      const path = [dirname, Context.config.entities.dto.converts.dirname].toPath;

      if (path.existsDir()) {
        handlers.push(() => {
          path.dirRm();
          dirname.padPrefix(DtoContext.groupCurDto[dirname].length.toString() + '：').printSuccess('Total');
        });
      }
    }
  }

  return handlers;
}

async function clearDtoItem(info: DtoFileInfo) {
  const convertInfo = info.convertInfo!;
  const path = [info.filepath.dirname(), Context.config.entities.dto.converts.dirname].toPath;

  if (!path.existsDir()) return;

  if (Object.equal(DtoContext.groupAllDto[info.dirname].length, DtoContext.groupCurDto[info.dirname].length)) {
    const ast = info.filepath.toUtf8Code.parseBabel;

    traverse(ast, {
      enter(path) {
        if (bt.isImportDeclaration(path.node)) {
          if (path.node.source.value.includes(Context.config.entities.dto.converts.dirname)) {
            path.remove();
          }
        }

        if (bt.isClassMethod(path.node)) {
          if (bt.isIdentifier(path.node.key)) {
            if ([Context.config.entities.dto.override.fromJson, Context.config.entities.dto.override.toList].includes(path.node.key.name)) {
              path.remove();
            } else {
              path.insertBefore(I_FILE_SPACED_AST);
              path.insertAfter(I_FILE_SPACED_AST);
            }
          }
        }

        if (bt.isClassProperty(path.node)) {
          path.insertBefore(I_FILE_SPACED_AST);
          path.insertAfter(I_FILE_SPACED_AST);
        }

        if (isDtoClass(path.node)) {
          path.insertBefore(I_FILE_SPACED_AST);
          path.insertAfter(I_FILE_SPACED_AST);
        }
      },
    });

    const code = generate(ast).code.replaceAll(I_FILE_SPACED, '\n');

    const data = await code.formatter;

    return () => {
      info.filepath.rewrite(data, { remove: false });
      convertInfo.filename.printInfo('Removed');
    };
  } else {
    const ast = convertInfo.root.toUtf8Code.parseBabel;

    traverse(ast, {
      enter(path) {
        if (bt.isExportAllDeclaration(path.node)) {
          path.insertBefore(I_FILE_SPACED_AST);
          if (path.node.source.value.includes(convertInfo.filename)) {
            path.remove();
          }
        }
      },
    });

    const code = generate(ast).code.replaceAll(I_FILE_SPACED, '\n');

    const data = await code.formatter;

    return () => {
      convertInfo.root.rewrite(data, { remove: false });
      convertInfo.filepath.remove();
      convertInfo.filename.printInfo('Removed');
    };
  }
}
