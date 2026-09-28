import { EntitiesConfiguration } from 'types';

export const entitiesConfiguration: EntitiesConfiguration = {
  entry: 'index',
  dirname: 'entities',
  dto: {
    hookName: 'BaseDto',
    namespace: '{{name}}Dto',
    fileSuffix: '.dto',
    override: {
      toList: 'toList',
      fromJson: 'fromJson',
    },
    converts: {
      matched: /\.dto.ts$/,
      resultId: 'dto',
      fromId: 'json',
      entry: 'index',
      dirname: '_converts',
    },
    decorators: {
      required: 'Required',
      default: 'Default',
      originalKey: 'OriginalKey',
      freeze: 'Freeze',
      list: 'List',
      whenList: 'WhenList',
      whenMap: 'WhenMap',
      jsonEncoded: 'JsonEncoded',
    },
  },
};
