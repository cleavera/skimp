import { IMeta, MetaKey, Nullable } from '../../shared';
import { Location } from './location';

export class ModelRegister {
    private readonly _meta: IMeta;

    constructor(meta: IMeta) {
        this._meta = meta;
    }

    public setLocation(model: any, location: Location): void {
        this._meta.set(model, MetaKey.LOCATION, location);
    }

    public getLocation(model: any): Nullable<Location> {
        return this._meta.get(model, MetaKey.LOCATION);
    }
}
