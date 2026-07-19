import { DtoFileInfo } from '../../../models';

export const getFromJsonName = (dto: DtoFileInfo) => {
  return dto.dtoName.padPrefix('_$').padSuffix(Context.config.entities.dto.override.fromJson.firstToUpper);
};
