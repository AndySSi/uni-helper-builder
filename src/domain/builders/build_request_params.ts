import { ORIGINAL_KEYS } from 'src/_constants';

import { DomainCreateTemplate } from '../models';
import { DomainRuntime } from '../context';

export async function buildRequestParams() {
  return RequestParamsBuildFactory[DomainRuntime.createType]();
}

class RequestParamsBuildFactory {
  static [DomainCreateTemplate.empty] = () =>
    withBuilder(async () => {
      const { target } = DomainRuntime.namespace;

      const root = [target, Context.config.requestParams.dirname].toPath;

      const indexCode = '';

      return { root, codes: [[[root, Context.config.requestParams.entry.padSuffix(ORIGINAL_KEYS.ts.suffix)].toPath, indexCode]] };
    });
}
