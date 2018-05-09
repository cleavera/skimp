import { Location } from '../classes/location';

export interface IDb {
    exists(location: Location): Promise<boolean>;
    get(location: Location): Promise<any>;
    list(location: Location): Promise<Array<any>>;
    delete(location: Location): Promise<void>;
    set(location: Location, model: any): Promise<void>;
}
