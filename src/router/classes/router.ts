import * as $uuid from 'uuid/v4';
import { DB_REGISTER, MODEL_REGISTER } from '..';
import { LOGGER } from '../../debug';
import { ISchema, SCHEMA_REGISTER } from '../../schema';
import { IRouter, Request, RequestMethod, Response, ResponseCode } from '../../server';
import { Nullable } from '../../shared';
import { ValidationException, ValidationExceptions } from '../../validation';
import { MethodNotAllowedException } from '../exceptions/method-not-allowed.exception';
import { ResourceDoesNotExistException } from '../exceptions/resource-does-not-exist.exception';
import { IApi } from '../interfaces/api.interface';
import { IDb } from '../interfaces/db.interface';
import { Location } from './location';

export class Router implements IRouter {
    private _api: IApi;
    private _db: IDb;

    constructor(api: IApi, db: IDb) {
        this._api = api;
        this._db = db;

        DB_REGISTER.configure(db);
    }

    public async route(request: Request, response: Response): Promise<void> {
        try {
            if (!SCHEMA_REGISTER.getSchema(request.url.resourceName)) {
                throw new ResourceDoesNotExistException(request.url);
            }

            const location: Location = Location.fromUrl(request.url);
            let model: any = null;

            if (request.content) {
                model = this._api.deserialise(request.content.json(), location);

                const validationIssues: ValidationExceptions = await SCHEMA_REGISTER.validate(model);

                if (validationIssues.length) {
                    throw validationIssues;
                }
            }

            if (request.isGet) {
                await this._get(location, response);

                return;
            } else if (request.isPut) {
                await this._put(location, model, response);

                return;
            } else if (request.isPost) {
                await this._post(location, model, response);

                return;
            } else if (request.isDelete) {
                await this._delete(location, response);

                return;
            } else {
                throw new MethodNotAllowedException(request.method as RequestMethod, request.url);
            }
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                LOGGER.warn(e);
                this._api.error(response, ResponseCode.NOT_FOUND);
            } else if (e instanceof MethodNotAllowedException) {
                LOGGER.warn(e);
                this._api.error(response, ResponseCode.METHOD_NOT_ALLOWED);
            } else if (e instanceof ValidationExceptions) {
                LOGGER.warn(...e);
                this._api.error(response, ResponseCode.BAD_REQUEST, e);
            } else if (e instanceof ValidationException) {
                LOGGER.warn(e);
                this._api.error(response, ResponseCode.BAD_REQUEST, [e]);
            } else {
                throw e;
            }
        }
    }

    private async _get(location: Location, response: Response): Promise<void> {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (location.resourceId) {
            this._api.respond(response, await this._db.get(location));

            return;
        }

        this._api.respond(response, await this._db.list(location));
    }

    private async _post(location: Location, model: any, response: Response): Promise<void> {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (location.resourceId) {
            if (await this._db.exists(location)) {
                throw new MethodNotAllowedException(RequestMethod.POST, location.toUrl());
            } else {
                throw new ResourceDoesNotExistException(location.toUrl());
            }
        }

        const createdLocation: Location = new Location(location.resourceName, $uuid());

        await this._db.set(createdLocation, model);
        await this._updateRelationships(createdLocation, model);

        this._api.respond(response, await this._db.get(createdLocation), true);
    }

    private async _put(location: Location, model: any, response: Response): Promise<void> {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (!location.resourceId) {
            throw new MethodNotAllowedException(RequestMethod.PUT, location.toUrl());
        }

        const isCreate: boolean = !await this._db.exists(location);

        let oldModel: any;

        if (!isCreate) {
            oldModel = await this._db.get(location);
        }

        await this._db.set(location, model);
        await this._updateRelationships(location, model, oldModel);

        this._api.respond(response, await this._db.get(location), isCreate);
    }

    private async _delete(location: Location, response: Response): Promise<void> {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (!location.resourceId) {
            throw new MethodNotAllowedException(RequestMethod.DELETE, location.toUrl());
        }

        const oldModel: any = await this._db.get(location);

        await this._db.delete(location);
        await this._updateRelationships(location, null, oldModel);

        response.noContent();
    }

    private async _updateRelationships(location: Location, model?: any, previousModel?: any): Promise<void> {
        const newRelationships: Array<Location> = MODEL_REGISTER.getRelationships(model);
        const oldRelationships: Array<Location> = MODEL_REGISTER.getRelationships(previousModel);
        const added: Array<Location> = newRelationships.filter((item: Location) => {
            return oldRelationships.indexOf(item) === -1;
        });

        const removed: Array<Location> = oldRelationships.filter((item: Location) => {
            return newRelationships.indexOf(item) === -1;
        });

        for (const item of added) {
            const otherModel: any = await this._db.get(item);

            MODEL_REGISTER.addRelationship(otherModel, location);

            await this._db.set(item, otherModel);
        }

        for (const item of removed) {
            const otherModel: any = await this._db.get(item);

            MODEL_REGISTER.removeRelationship(otherModel, location);

            await this._db.set(item, otherModel);
        }
    }
}
