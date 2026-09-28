import ts from 'typescript';

export enum DecoratorKeys {
  required = 'Required',
  default = 'Default',
  originalKey = 'OriginalKey',
  whenList = 'WhenList',
  whenMap = 'WhenMap',
  jsonEncoded = 'JsonEncoded',
}

export enum CommandDtoType {
  build,
  clear,
}

export interface DtoFileInfo {
  filepath: string;
  dirname: string;
  dtoName: string;
  config: {
    heritageName: string;
    heritageInfo: DtoFileInfo;
    abstract: boolean;
  };
  convertInfo?: ConvertInfo;
  extendedName?: string;
}

export interface ConvertInfo {
  root: string;
  rootDir: string;
  filepath: string;
  filename: string;
}

export interface DtoFieldProp {
  field: string;
  option: MappedOption;
  questionToken: boolean;
}

export type MappedOption = {
  [DecoratorKeys.required]?: boolean;
  [DecoratorKeys.originalKey]?: string;
  [DecoratorKeys.default]?: {
    vKind: ts.SyntaxKind;
    tKind: ts.SyntaxKind;
    value: string;
    source?: string;
  };
  [DecoratorKeys.whenList]?: string;
  [DecoratorKeys.whenMap]?: string;
  [DecoratorKeys.jsonEncoded]?: boolean;
};
