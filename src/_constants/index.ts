import { expressionStatement, stringLiteral } from '@babel/types';

export * from './configuration';

interface KeywordOptions {
  readonly id: string;
}

export const keywords: KeywordOptions = {
  id: 'id',
};

export const CONFIG_FILE_NAME = '.custom.config.ts';

export const getDtoNamespace = (name: string) => {
  if (typeof Context.config.entities.dto.namespace === 'string') {
    return Context.config.entities.dto.namespace.replace('{{name}}', name);
  }

  return Context.config.entities.dto.namespace(name);
};

export const getDomainNamespace = (name: string) => {
  if (typeof Context.config.domain.namespace === 'string') {
    return Context.config.domain.namespace.replace('{{name}}', name);
  }

  return Context.config.domain.namespace(name);
};

export const getRepositoryNamespace = (name: string) => {
  if (typeof Context.config.repository.namespace === 'string') {
    return Context.config.repository.namespace.replace('{{name}}', name);
  }

  return Context.config.repository.namespace(name);
};

export const DEPENDENCIES_INFO = {
  project: {
    id: 'id',
    list: 'list',
  },
  error: {
    message: '发生未知异常~',
  },
};

export const ORIGINAL_KEYS = {
  promise: 'Promise',
  array: 'Array',
  object: 'Object',
  this: 'this',
  call: 'call',
  bind: 'bind',
  builtIn: {
    map: 'map',
    find: 'find',
    some: 'some',
    forEach: 'forEach',
    freeze: 'freeze',
  },
  arguments: {
    value: 'value',
    item: 'item',
    res: 'res',
  },
  ts: {
    suffix: '.ts',
    record: 'Record',
    string: 'string',
  },
  undefined: 'undefined',
};

export const DDD_NAME_REGEX = /^[a-zA-Z]+(?:_[a-zA-Z]+)*$/;

const I_FILE_SPACED_NAME = `I___DTO___FILE___SPACED;`;
export const I_FILE_SPACED = `"${I_FILE_SPACED_NAME}";`;

export const I_FILE_SPACED_AST = expressionStatement(stringLiteral(I_FILE_SPACED_NAME));
