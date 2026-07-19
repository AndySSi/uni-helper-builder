import { BaseBuildCommand } from 'src/base';
import { DtoContext } from '../context';

export class DtoBuildCommand extends BaseBuildCommand {
  constructor() {
    super();
    DtoContext.reset();
  }
}
