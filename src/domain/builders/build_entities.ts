import { ORIGINAL_KEYS } from 'src/_constants';

import { DomainCreateTemplate } from '../models';
import { DomainRuntime } from '../context';

export async function buildEntities() {
  return EntitiesBuildFactory[DomainRuntime.createType]();
}

class EntitiesBuildFactory {
  static [DomainCreateTemplate.empty] = () =>
    withBuilder(async () => {
      const { target } = DomainRuntime.namespace;

      const root = [target, Context.config.entities.dirname].toPath;

      const indexCode = '';

      return { root, codes: [[[root, Context.config.entities.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath, indexCode]] };
    });
}
