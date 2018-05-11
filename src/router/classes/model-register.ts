import { IMeta, MetaKey, Nullable } from '../../shared';
import { Location } from './location';

export class ModelRegister {
    private readonly _meta: IMeta;

    constructor(meta: IMeta) {
        this._meta = meta;
    }

    public setCreatedDate(model: any, created: Date): void {
        this._meta.set(model, MetaKey.CREATED, created);
    }

    public getCreatedDate(model: any): Nullable<Date> {
        return this._meta.get(model, MetaKey.CREATED);
    }

    public setLocation(model: any, location: Location): void {
        this._meta.set(model, MetaKey.LOCATION, location);
    }

    public getLocation(model: any): Nullable<Location> {
        return this._meta.get(model, MetaKey.LOCATION);
    }
}
