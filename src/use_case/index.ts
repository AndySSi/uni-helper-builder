import { configuration } from 'src/configuration';

import { CommandUseCaseType } from './models';
import { UseCaseBuildCommand } from './commands';
import { BuildProcess } from './build_process';

export async function buildUseCase() {
  try {
    const domainDir = Context.config.domain.dirname.findDirectories({ excludes: configuration.excludes })!;

    if (!domainDir) {
      `Create a ${Context.config.domain.dirname} directory first`.printError(true);
    }

    const command = new UseCaseBuildCommand(domainDir);

    await Interactive.route(CommandUseCaseType[CommandUseCaseType.create], async () => {
      await command.getDomainName();
      await command.getSourceName();
      await command.getCaseType();
      await command.getMethodType();
      await command.getResultType();

      new BuildProcess().run();
    }).runner();
  } catch (error) {
    // console.log(error)
    // DEPENDENCIES_INFO.error.message.printError();
    // nothing...
  }
}
