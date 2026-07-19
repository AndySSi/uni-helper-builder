import { BaseBuildProcess } from 'src/base';
import { buildEntities, buildRequestParams, buildRepository, buildIndex, buildCases } from './builders';
import { DomainRuntime } from './context';

export class BuildProcess extends BaseBuildProcess {
  override async run() {
    const builders = await [buildEntities(), buildRequestParams(), buildRepository(), buildCases(), buildIndex()].forAwait();

    if (builders) {
      DomainRuntime.filepath.makeDir();

      builders.forEach((handler) => {
        handler?.();
      });
    }
  }
}
