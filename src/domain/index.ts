import { configuration } from 'src/configuration';
import { BuildProcess } from './build_process';
import { DomainBuildCommand } from './commands';
import { DomainRunnerType } from './models';

export async function buildDomain() {
  try {
    const domainDir = Context.config.domain.dirname.findDirectories({ excludes: configuration.excludes })!;

    if (!domainDir) {
      `Create a ${Context.config.domain.dirname} directory first`.printError(true);
    }

    const command = new DomainBuildCommand(domainDir);

    await Interactive.route(DomainRunnerType[DomainRunnerType.create], async () => {
      await command.getCreateType();

      await command.getDomainName();
      await new BuildProcess().run();
    })
      .route(DomainRunnerType[DomainRunnerType.delete], command.deleteDomain.bind(command))
      .runner();
  } catch (error) {
    // DEPENDENCIES_INFO.error.message.printError();
    // nothing...
  }
}
