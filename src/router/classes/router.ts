import * as $uuid from 'uuid/v4';
import { LOGGER } from '../../debug';
import { ISchema, SCHEMA_REGISTER } from '../../schema';
import { IRouter, Request, Response, ResponseCode, ResponseMethod } from '../../server';
import { Nullable } from '../../shared';
import { ModelValidationExceptions } from '../../validators';
import { MethodNotAllowedException } from '../exceptions/method-not-allowed.exception';
import { ResourceDoesNotExistException } from '../exceptions/resource-does-not-exist.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { IApi } from '../interfaces/api.interface';
import { IDb } from '../interfaces/db.interface';
import { Location } from './location';

export class Router implements IRouter {
    private _api: IApi;
    private _db: IDb;

    constructor(api: IApi, db: IDb) {
        this._api = api;
        this._db = db;
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

                const validationIssues: ModelValidationExceptions = SCHEMA_REGISTER.validate(model);

                if (validationIssues.length) {
                    throw validationIssues;
                }
            }

            if (request.isGet) {
                return await this._get(location, response);
            } else if (request.isPut) {
                return await this._put(location, model, response);
            } else if (request.isPost) {
                return await this._post(location, model, response);
            } else if (request.isDelete) {
                return await this._delete(location, response);
            } else {
                throw new MethodNotAllowedException(request.method as ResponseMethod, request.url);
            }
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                LOGGER.warn(e);
                this._api.error(response, ResponseCode.NOT_FOUND);
            } else if (e instanceof MethodNotAllowedException) {
                LOGGER.warn(e);
                this._api.error(response, ResponseCode.METHOD_NOT_ALLOWED);
            } else if (e instanceof ModelValidationExceptions) {
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
            return this._api.respond(response, await this._db.get(location));
        }

        return this._api.respond(response, await this._db.list(location));
    }

    private async _post(location: Location, model: any, response: Response): Promise<void> {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (location.resourceId) {
            if (await this._db.exists(location)) {
                throw new MethodNotAllowedException(ResponseMethod.POST, location.toUrl());
            } else {
                throw new ResourceDoesNotExistException(location.toUrl());
            }
        }

        const createdLocation: Location = new Location(location.resourceName, $uuid());

        await this._db.set(createdLocation, model);

        this._api.respond(response, await this._db.get(createdLocation), true);
    }

    private async _put(location: Location, model: any, response: Response): Promise<void> {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (!location.resourceId) {
            throw new MethodNotAllowedException(ResponseMethod.PUT, location.toUrl());
        }

        const isCreate: boolean = !await this._db.exists(location);

        await this._db.set(location, model);

        this._api.respond(response, await this._db.get(location), isCreate);
    }

    private async _delete(location: Location, response: Response): Promise<void> {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (!location.resourceId) {
            throw new MethodNotAllowedException(ResponseMethod.DELETE, location.toUrl());
        }

        await this._db.delete(location);

        response.noContent();
    }
}
