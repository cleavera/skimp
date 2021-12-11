import * as MetaKey from '../constants/meta-field-names.constant';
import { IMeta } from '../interfaces/meta.interface';
import { ResourceLocation } from './resource-location';

export class ModelRegister {
    private readonly _meta: IMeta;

    constructor(meta: IMeta) {
        this._meta = meta;
    }

    public setCreatedDate(model: object, created: Date): void {
        this._meta.set(model, MetaKey.CREATED, created);
    }

    public getCreatedDate(model: object): Date | null {
        return this._meta.get(model, MetaKey.CREATED);
    }

    public setLocation(model: object, location: ResourceLocation): void {
        this._meta.set(model, MetaKey.LOCATION, location);
    }

    public getLocation(model: object): ResourceLocation | null {
        return this._meta.get(model, MetaKey.LOCATION);
    }

    public addRelationship(model: object, relationship: ResourceLocation): void {
        const relationships: Array<ResourceLocation> = this._meta.get(model, MetaKey.MODEL_RELATIONSHIPS) ?? [];

        relationships.push(relationship);

        this._meta.set(model, MetaKey.MODEL_RELATIONSHIPS, relationships);
    }

    public addLink(model: object, link: ResourceLocation): void {
        const links: Array<ResourceLocation> = this._meta.get(model, MetaKey.LINKS) ?? [];

        links.push(link);

        this._meta.set(model, MetaKey.LINKS, links);
    }

    public removeRelationship(model: object, relationship: ResourceLocation): void {
        const relationships: Array<ResourceLocation> = this._meta.get(model, MetaKey.MODEL_RELATIONSHIPS) ?? [];

        relationships.splice(relationships.indexOf(relationship), 1);

        this._meta.set(model, MetaKey.MODEL_RELATIONSHIPS, relationships);
    }

    public getRelationships(model: object): Array<ResourceLocation> {
        return this._meta.get(model, MetaKey.MODEL_RELATIONSHIPS) ?? [];
    }

    public getLinks(model: object): Array<ResourceLocation> {
        return this._meta.get(model, MetaKey.LINKS) ?? [];
    }
}
