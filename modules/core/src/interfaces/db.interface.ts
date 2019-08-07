import { ResourceLocation } from '../classes/resource-location';

export interface IDb {
    exists(location: ResourceLocation): Promise<boolean>;
    get(location: ResourceLocation): Promise<object>;
    list(location: ResourceLocation): Promise<Array<object>>;
    delete(location: ResourceLocation): Promise<void>;
    set(location: ResourceLocation, model: object): Promise<void>;
}
