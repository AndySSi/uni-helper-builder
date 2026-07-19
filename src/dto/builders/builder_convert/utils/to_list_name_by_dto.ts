import { DtoFileInfo } from '../../../models';

export const getToListName = (dto: DtoFileInfo) => {
  return dto.dtoName.padPrefix('_$').padSuffix(Context.config.entities.dto.override.toList.firstToUpper);
};
