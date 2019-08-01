import { $isNull, Maybe } from '@cleavera/utils';
import { API_REGISTER, ContentTypeNotSupportedException, DB_REGISTER, IApi, IDb, IRequest, IRouter, MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { LOGGER } from '@skimp/debug';
import { IResponse, RequestMethod, ResponseCode } from '@skimp/http';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException, ValidationException, ValidationExceptions } from '@skimp/schema';
import * as $uuid from 'uuid/v4';

import { MethodNotAllowedException } from '../exceptions/method-not-allowed.exception';
import { NotAuthorisedException } from '../exceptions/not-authorised.exception';
import { ResourceDoesNotExistException } from '../exceptions/resource-does-not-exist.exception';
import { IAuthenticator } from '../interfaces/authenticator.interface';
import { RootSchema } from '../schemas/root.schema';

export class Router implements IRouter {
    public version: string;
    public authenticator: Maybe<IAuthenticator>;

    private _db: IDb;

    constructor(version: string, authenticator: Maybe<IAuthenticator> = null) {
        this.authenticator = authenticator;
        this._db = DB_REGISTER.get();
        this.version = version;
    }

    public async route(request: IRequest, response: IResponse): Promise<void> {
        try {
            const api: IApi = API_REGISTER.get(request.type);

            if (!$isNull(this.authenticator)) {
                try {
                    this.authenticator.authenticate(request);
                } catch (e) {
                    throw new NotAuthorisedException();
                }
            }

            if ($isNull(request.location)) {
                await this._root(response, api);

                return;
            }

            if (!SCHEMA_REGISTER.getSchema(request.location.resourceName)) {
                throw new ResourceDoesNotExistException(request.location);
            }

            let model: any = null;

            if (!$isNull(request.content)) {
                model = API_REGISTER.get(request.content.type).deserialise(request.content.raw, request.location);

                const validationIssues: ValidationExceptions = await SCHEMA_REGISTER.validate(model);

                if (validationIssues.length) {
                    throw validationIssues;
                }
            }

            if (request.isGet) {
                await this._get(request.location, response, api);

                return;
            } else if (request.isPut) {
                await this._put(request.location, model, response, api);

                return;
            } else if (request.isPost) {
                await this._post(request.location, model, response, api);

                return;
            } else if (request.isDelete) {
                await this._delete(request.location, response);

                return;
            } else if (request.isOptions) {
                await this._options(request.location, response);

                return;
            } else {
                throw new MethodNotAllowedException(request.method as RequestMethod, request.location);
            }
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.NOT_FOUND);
            } else if (e instanceof MethodNotAllowedException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.METHOD_NOT_ALLOWED);
            } else if (e instanceof ValidationExceptions) {
                LOGGER.warn(...e);
                API_REGISTER.get().error(response, ResponseCode.BAD_REQUEST, e);
            } else if (e instanceof ValidationException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.BAD_REQUEST, [e]);
            } else if (e instanceof ContentTypeNotSupportedException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.NOT_ACCEPTABLE);
            } else if (e instanceof ContentTypeNotSupportedException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.BAD_REQUEST);
            } else if (e instanceof NotAuthorisedException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.NOT_AUTHORISED);
            } else {
                throw e;
            }
        }
    }

    private async _get(location: ResourceLocation, response: IResponse, api: IApi): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        if (location.isEntity()) {
            api.respond(response, await this._db.get(location), location);

            return;
        }

        api.respond(response, await this._db.list(location), location);
    }

    private async _post(location: ResourceLocation, model: any, response: IResponse, api: IApi): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        if (location.isEntity()) {
            if (await this._db.exists(location)) {
                throw new MethodNotAllowedException(RequestMethod.POST, location);
            } else {
                throw new ResourceDoesNotExistException(location);
            }
        }

        const createdLocation: ResourceLocation = new ResourceLocation(location.resourceName, $uuid());

        await this._db.set(createdLocation, model);
        await this._updateRelationships(createdLocation, model);

        api.respond(response, await this._db.get(createdLocation), location, true);
    }

    private async _put(location: ResourceLocation, model: any, response: IResponse, api: IApi): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        if (!location.isEntity()) {
            throw new MethodNotAllowedException(RequestMethod.PUT, location);
        }

        const isCreate: boolean = !await this._db.exists(location);

        let oldModel: any;

        if (!isCreate) {
            oldModel = await this._db.get(location);
        }

        await this._db.set(location, model);
        await this._updateRelationships(location, model, oldModel);

        api.respond(response, await this._db.get(location), location, isCreate);
    }

    private async _delete(location: ResourceLocation, response: IResponse): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        if (!location.isEntity()) {
            throw new MethodNotAllowedException(RequestMethod.DELETE, location);
        }

        const oldModel: any = await this._db.get(location);

        await this._db.delete(location);
        await this._updateRelationships(location, null, oldModel);

        response.noContent();
    }

    private async _options(location: ResourceLocation, response: IResponse): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        response.noContent();
    }

    private async _updateRelationships(location: ResourceLocation, model?: any, previousModel?: any): Promise<void> {
        const newRelationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(model);
        const oldRelationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(previousModel);
        const added: Array<ResourceLocation> = newRelationships.filter((item: ResourceLocation) => {
            return oldRelationships.indexOf(item) === -1;
        });

        const removed: Array<ResourceLocation> = oldRelationships.filter((item: ResourceLocation) => {
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

    private async _root(response: IResponse, api: IApi): Promise<void> {
        const model: RootSchema = new RootSchema();
        const location: ResourceLocation = new ResourceLocation('');

        model.version = this.version;

        SCHEMA_REGISTER.register(RootSchema, 'ROOT', true);
        SCHEMA_REGISTER.addFieldMapping(RootSchema, 'version', 'version');
        MODEL_REGISTER.setLocation(model, location);

        SCHEMA_REGISTER.schemas.forEach((schema: ISchema) => {
            const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);

            if (!resourceName) {
                throw new SchemaNotRegisteredException(schema);
            }

            MODEL_REGISTER.addLink(model, new ResourceLocation(resourceName));
        });

        api.respond(response, model, location);
    }
}
