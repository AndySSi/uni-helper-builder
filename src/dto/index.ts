import { BuildProcess } from './build_process';
import { DtoBuildCommand } from './commands';
import { CommandDtoType } from './models';

export async function buildDto() {
  try {
    new DtoBuildCommand();

    await Interactive.route(CommandDtoType[CommandDtoType.build], async () => {
      await new BuildProcess().run();
    })
      .route(CommandDtoType[CommandDtoType.clear], async () => {
        await new BuildProcess().clear();
      })
      .runner();
  } catch (error) {
    console.log(error);
    // DEPENDENCIES_INFO.error.message.printError();
    // nothing...
  }
}
