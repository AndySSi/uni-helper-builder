import { BaseBuildCommand } from 'src/base';
import { DDD_NAME_REGEX } from 'src/_constants';
import { DomainCreateTemplate } from '../models';
import { DomainRuntime } from '../context';

export class DomainBuildCommand extends BaseBuildCommand {
  constructor(public dirname: string) {
    super();
    DomainRuntime.dirname = dirname;
  }

  async getCreateType() {
    DomainRuntime.createType = DomainCreateTemplate.empty;
  }

  async getDomainName() {
    const name = await Interactive.of('Please enter a domain name');

    if (!DDD_NAME_REGEX.test(name)) {
      `invalid name ${name}`.printError(true);
    }

    DomainRuntime.domainName = name;

    if (DomainRuntime.filepath.existsDir()) {
      `The ${name} service directory already exists`.printError(true);
    }
  }

  async deleteDomain() {
    const children = this.dirname.dirChildren({ mode: 0 });

    if (!children.length) {
      this.dirname.padSuffix('当前目录为空').printError(true);
    }

    const indexes = await Interactive.select(children, true);

    const selection = children.getByIndexes(...indexes);

    const confirm = await this.deleteConfirm(selection);

    if (confirm) {
      selection.forEach((item) => {
        const path = [this.dirname, item].toPath;
        path.dirRm();
        path.printInfo('Removed');
      });
    }
  }

  private async deleteConfirm(selection: string[]) {
    return await Interactive.confirm(`clear ${selection.join()} ?`);
  }
}
