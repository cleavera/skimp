import { ResourceLocation } from '../classes/resource-location';

export interface IDb {
    exists(location: ResourceLocation): Promise<boolean>;
    get(location: ResourceLocation): Promise<any>;
    list(location: ResourceLocation): Promise<Array<any>>;
    delete(location: ResourceLocation): Promise<void>;
    set(location: ResourceLocation, model: any): Promise<void>;
}
