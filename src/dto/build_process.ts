import { BaseBuildProcess } from 'src/base';

import { clearDto, BuilderConvert } from './builders';
import { DtoContext } from './context';

export class BuildProcess extends BaseBuildProcess {
  override async run(): Promise<void> {
    try {
      let builders: ((() => void) | undefined)[] = [];

      for (const dirname in DtoContext.groupCurDto) {
        builders = builders.concat(await BuilderConvert.build(DtoContext.groupCurDto[dirname], DtoContext.groupAllDto[dirname]));
      }

      builders.forEach((handler) => {
        handler?.();
      });
    } catch (error) {
      console.error(error);
    }
  }

  async clear(): Promise<void> {
    try {
      const builders = await clearDto();

      if (!builders.filter(Boolean).length) {
        '无'.printInfo();
        return;
      }

      builders.forEach((handler) => {
        handler?.();
      });
    } catch (error) {
      console.error(error);
    }
  }

  async watch(): Promise<void> {
    'file total:'.padSuffix(DtoContext.allDtoFiles.length.toString()).printSuccess('Watching');
    Object.dirWatch({
      entry: 'src',
      includes: [Context.config.entities.dto.converts.matched],
      listen: (event, filepath) => {
        if (event === 'change') {
          const target = DtoContext.allDtoFiles.filter((res) => res.filepath === filepath);
          if (target.length) {
            DtoContext.groupCurDto = { [target[0].dirname]: target };
            this.run();
          }
        }

        if (event === 'remove') {
          const target = DtoContext.allDtoFiles.filter((res) => res.filepath === filepath);
          if (target.length) {
            DtoContext.groupCurDto = { [target[0].dirname]: target };
            this.clear();
          }
        }

        if (['remove', 'create'].includes(event)) {
          DtoContext.reset();
          'file total:'.padSuffix(DtoContext.allDtoFiles.length.toString()).printSuccess('Watching');
        }
      },
    });
  }
}
