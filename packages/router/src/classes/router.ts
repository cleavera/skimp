import { isEmpty, isNull } from '@cleavera/utils';
import { API_REGISTER, DB_REGISTER, IApi, IContent, IDb, IResponse, MODEL_REGISTER, ResourceDoesNotExistException, ResourceLocation } from '@skimp/core';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException, ValidationExceptions } from '@skimp/schema';
import { v4 as uuid } from 'uuid';

import { Action } from '../constants/action.contant';
import { ActionNotAllowedException } from '../exceptions/action-not-allowed.exception';
import { CannotParseModelWithNoLocationException } from '../exceptions/cannot-parse-model-with-no-location.exception';
import { RootSchema } from '../schemas/root.schema';

export class Router {
    public version: string;

    private readonly _db: IDb;

    constructor(version: string) {
        this._db = DB_REGISTER.get();
        this.version = version;
    }

    public async get(location: ResourceLocation, response: IResponse, api: IApi): Promise<void> {
        this._assertExists(location);

        if (location.isEntity()) {
            api.respond(response, await this._db.get(location), location);

            return;
        }

        api.respond(response, await this._db.list(location), location);
    }

    public async post(location: ResourceLocation, content: IContent, response: IResponse, api: IApi): Promise<void> {
        this._assertExists(location);

        const model: object = await this._parseModel(content, location);

        if (location.isEntity()) {
            if (await this._db.exists(location)) {
                throw new ActionNotAllowedException(Action.POST, location);
            } else {
                throw new ResourceDoesNotExistException(location);
            }
        }

        const createdLocation: ResourceLocation = new ResourceLocation(location.resourceName, uuid());

        await this._db.set(createdLocation, model);
        await this._updateRelationships(createdLocation, model);

        api.respond(response, await this._db.get(createdLocation), location, true);
    }

    public async put(location: ResourceLocation, content: IContent, response: IResponse, api: IApi): Promise<void> {
        this._assertExists(location);

        const model: object = await this._parseModel(content, location);

        if (!location.isEntity()) {
            throw new ActionNotAllowedException(Action.PUT, location);
        }

        const isCreate: boolean = !await this._db.exists(location);

        let oldModel: object | null = null;

        if (!isCreate) {
            oldModel = await this._db.get(location);
        }

        await this._db.set(location, model);
        await this._updateRelationships(location, model, oldModel);

        api.respond(response, await this._db.get(location), location, isCreate);
    }

    public async remove(location: ResourceLocation, response: IResponse): Promise<void> {
        this._assertExists(location);

        if (!location.isEntity()) {
            throw new ActionNotAllowedException(Action.DELETE, location);
        }

        const oldModel: object = await this._db.get(location);

        await this._db.delete(location);
        await this._updateRelationships(location, null, oldModel);

        response.noContent();
    }

    public async root(response: IResponse, api: IApi): Promise<void> {
        const model: RootSchema = new RootSchema();
        const location: ResourceLocation = new ResourceLocation('');

        model.version = this.version;

        await SCHEMA_REGISTER.register(RootSchema, 'ROOT', true);
        SCHEMA_REGISTER.addFieldMapping(RootSchema, 'version', 'version');
        MODEL_REGISTER.setLocation(model, location);

        SCHEMA_REGISTER.schemas.forEach((schema: ISchema) => {
            const resourceName: string | null = SCHEMA_REGISTER.getSchemaResourceName(schema);

            if (isNull(resourceName)) {
                throw new SchemaNotRegisteredException(schema);
            }

            MODEL_REGISTER.addLink(model, new ResourceLocation(resourceName));
        });

        api.respond(response, model, location);
    }

    private async _updateRelationships(location: ResourceLocation, model: object | null = null, previousModel: object | null = null): Promise<void> {
        const newRelationships: Array<ResourceLocation> = isNull(model) ? [] : MODEL_REGISTER.getRelationships(model);
        const oldRelationships: Array<ResourceLocation> = isNull(previousModel) ? [] : MODEL_REGISTER.getRelationships(previousModel);
        const added: Array<ResourceLocation> = newRelationships.filter((item: ResourceLocation) => {
            return !oldRelationships.includes(item);
        });

        const removed: Array<ResourceLocation> = oldRelationships.filter((item: ResourceLocation) => {
            return !newRelationships.includes(item);
        });

        for (const item of added) {
            const otherModel: object = await this._db.get(item);

            MODEL_REGISTER.addRelationship(otherModel, location);

            await this._db.set(item, otherModel);
        }

        for (const item of removed) {
            const otherModel: object = await this._db.get(item);

            MODEL_REGISTER.removeRelationship(otherModel, location);

            await this._db.set(item, otherModel);
        }
    }

    private async _parseModel(content: IContent, location: ResourceLocation | null): Promise<object> {
        if (isNull(location)) {
            throw new CannotParseModelWithNoLocationException();
        }

        const model: object = API_REGISTER.get(content.type).deserialise(content.raw, location);

        const validationIssues: ValidationExceptions = await SCHEMA_REGISTER.validate(model);

        if (!isEmpty(validationIssues)) {
            throw validationIssues; // eslint-disable-line @typescript-eslint/no-throw-literal
        }

        return model;
    }

    private _assertExists(location: ResourceLocation): void {
        const schema: ISchema | null = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }
    }
}
