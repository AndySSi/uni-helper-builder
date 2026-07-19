import { DomainConfiguration } from 'types';

export const domainConfiguration: DomainConfiguration = {
  dirname: 'domains',
  entry: 'index',
  hookName: 'BaseDomain',
  namespace: '{{name}}Domain',
  configFile: 'd.config.json',
  casesKey: 'cases',
  override: {
    on: 'on',
    args: 'args',
  },
};
