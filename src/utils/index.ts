import { Node as PathNode } from '@babel/traverse';
import * as bt from '@babel/types';

export const isDtoClass = (pathNode: PathNode): pathNode is bt.ClassDeclaration => {
  return Boolean(bt.isClassDeclaration(pathNode) && pathNode.id?.name.includes('Dto'));
};
