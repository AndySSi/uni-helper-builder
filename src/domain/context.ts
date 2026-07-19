import { BaseContext } from 'src/base';
import { DomainCreateConfig, DomainCreateTemplate, DomainConfigModel } from './models';
import { NamespaceBuilder } from './namespace';
import { configuration } from 'src/configuration';

export class DomainRuntime extends BaseContext {
  public static dirname: string;

  public static createType: DomainCreateTemplate;
  public static domainName: string;

  public static get filepath() {
    return [this.dirname, this.domainName].toPath;
  }
  public static get namespace() {
    return new NamespaceBuilder(this.filepath, this.domainName);
  }

  public static get config(): DomainCreateConfig {
    const [configFilePath] = <string[]>Context.config.domain.configFile.fileFilter({ excludes: configuration.excludes })!;
    const configData = JSON.parse(configFilePath.toUtf8Code);

    return configData;
  }

  public static override throughGet(context: DomainConfigModel) {
    DomainRuntime.createType = DomainCreateTemplate[context.type || 'empty'];
    DomainRuntime.domainName = context.name;
  }
}
