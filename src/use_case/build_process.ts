import { BaseBuildProcess } from 'src/base';
import { buildCases, buildEntities, buildRepository, buildRequestParams } from './builders';

export class BuildProcess extends BaseBuildProcess {
  override async run() {
    const builders = await [buildRequestParams(), buildEntities(), buildRepository(), buildCases()].forAwait();
    builders.forEach((handler) => {
      handler?.();
    });
  }

  static async buildEntity() {
    try {
      const builder = await buildEntities();
      builder?.();
    } catch (error) {
      console.log(error);
    }
  }
}
