import { ResourceLocation } from '@skimp/core';

import { IEntity } from './entity.interface';

export interface IEntityFactory {
    fromPath(path: string): Promise<IEntity>;
    parseResourceLocation(path: string): ResourceLocation;
}
