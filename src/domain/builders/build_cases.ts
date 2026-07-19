import { ORIGINAL_KEYS } from 'src/_constants';

import { DomainCreateTemplate } from '../models';
import { DomainRuntime } from '../context';

export async function buildCases() {
  return CasesStrategy[DomainRuntime.createType]();
}

class CasesStrategy {
  static [DomainCreateTemplate.empty] = () =>
    withBuilder(async () => {
      const { aggregateRoot, target } = DomainRuntime.namespace;

      const root = [target, Context.config.useCase.dirname].toPath;

      const indexCode = [
        [].classDeclaration({
          modifiers: [Object.modifier.exportKeyword],
          name: aggregateRoot,
        }),
      ].toStructure();

      return {
        root,
        codes: [[[root, Context.config.useCase.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath, indexCode]],
      };
    });
}
