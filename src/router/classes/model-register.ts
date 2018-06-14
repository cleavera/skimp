import { IMeta, Maybe, MetaKey } from '../../shared';

import { Location } from './location';

export class ModelRegister {
    private readonly _meta: IMeta;

    constructor(meta: IMeta) {
        this._meta = meta;
    }

    public setCreatedDate(model: any, created: Date): void {
        this._meta.set(model, MetaKey.CREATED, created);
    }

    public getCreatedDate(model: any): Maybe<Date> {
        return this._meta.get(model, MetaKey.CREATED);
    }

    public setLocation(model: any, location: Location): void {
        this._meta.set(model, MetaKey.LOCATION, location);
    }

    public getLocation(model: any): Maybe<Location> {
        return this._meta.get(model, MetaKey.LOCATION);
    }

    public addRelationship(model: any, relationship: Location): void {
        const relationships: Array<Location> = this._meta.get(model, MetaKey.MODEL_RELATIONSHIPS) || [];

        relationships.push(relationship);

        this._meta.set(model, MetaKey.MODEL_RELATIONSHIPS, relationships);
    }

    public addLink(model: any, link: Location): void {
        const links: Array<Location> = this._meta.get(model, MetaKey.LINKS) || [];

        links.push(link);

        this._meta.set(model, MetaKey.LINKS, links);
    }

    public removeRelationship(model: any, relationship: Location): void {
        const relationships: Array<Location> = this._meta.get(model, MetaKey.MODEL_RELATIONSHIPS) || [];

        relationships.splice(relationships.indexOf(relationship), 1);

        this._meta.set(model, MetaKey.MODEL_RELATIONSHIPS, relationships);
    }

    public getRelationships(model: any): Array<Location> {
        return this._meta.get(model, MetaKey.MODEL_RELATIONSHIPS) || [];
    }

    public getLinks(model: any): Array<Location> {
        return this._meta.get(model, MetaKey.LINKS) || [];
    }
}
