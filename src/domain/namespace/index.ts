import { DtoNames } from './dto_names';
import { EventNames } from './event_names';
import { CasesNames } from './cases_names';
import { ParamNames } from './param_names';
import { getDomainNamespace, getRepositoryNamespace } from 'src/_constants';

export class NamespaceBuilder {
  constructor(
    public readonly target: string,
    public readonly sourceName: string,
    public readonly finalName: string = sourceName.firstToUpper,
  ) {}

  get domain() {
    return getDomainNamespace(this.finalName);
  }

  get repository() {
    return getRepositoryNamespace(this.finalName);
  }

  get aggregateRoot() {
    return [this.finalName, Context.config.useCase.aggregateRoot].join('_').toHump();
  }

  get dto() {
    return DtoNames.call(this);
  }

  get event() {
    return EventNames.call(this);
  }

  get cases() {
    return CasesNames.call(this);
  }

  get params() {
    return ParamNames.call(this);
  }
}
