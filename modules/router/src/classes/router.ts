import { $isNull, Maybe } from '@cleavera/utils';
import { API_REGISTER, ContentTypeNotSupportedException, DB_REGISTER, IApi, IContent, IDb, IRequest, IResponse, IRouter, MODEL_REGISTER, ResourceDoesNotExistException, ResourceLocation, ResponseCode } from '@skimp/core';
import { LOGGER } from '@skimp/debug';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException, ValidationException, ValidationExceptions } from '@skimp/schema';
import * as $uuid from 'uuid/v4';

import { Action } from '../constants/action.contant';
import { CannotParseModelWithNoLocationException } from '../exceptions/cannot-parse-model-with-no-location.exception';
import { MethodNotAllowedException } from '../exceptions/method-not-allowed.exception';
import { NotAuthorisedException } from '../exceptions/not-authorised.exception';
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
            const api: IApi = this._getApi(request);

            this._authenticate(request);

            if ($isNull(request.location)) {
                await this.root(response, api);

                return;
            }

            if (request.isGet) {
                await this.get(request.location, response, api);

                return;
            }

            if (request.isPut) {
                await this.put(request.location, request.content, response, api);

                return;
            }

            if (request.isPost) {
                await this.post(request.location, request.content, response, api);

                return;
            }

            if (request.isDelete) {
                await this.remove(request.location, response);

                return;
            }

            throw new MethodNotAllowedException(request.method as any, request.location);
        } catch (e) {
            this._handleError(e, response);
        }
    }

    public async get(location: ResourceLocation, response: IResponse, api: IApi): Promise<void> {
        this._assertExists(location);

        if (location.isEntity()) {
            api.respond(response, await this._db.get(location), location);

            return;
        }

        api.respond(response, await this._db.list(location), location);
    }

    public async post(location: ResourceLocation, content: Maybe<IContent>, response: IResponse, api: IApi): Promise<void> {
        this._assertExists(location);

        const model: Maybe<object> = await this._parseModel(content, location);

        if (location.isEntity()) {
            if (await this._db.exists(location)) {
                throw new MethodNotAllowedException(Action.POST, location);
            } else {
                throw new ResourceDoesNotExistException(location);
            }
        }

        const createdLocation: ResourceLocation = new ResourceLocation(location.resourceName, $uuid());

        await this._db.set(createdLocation, model);
        await this._updateRelationships(createdLocation, model);

        api.respond(response, await this._db.get(createdLocation), location, true);
    }

    public async put(location: ResourceLocation, content: Maybe<IContent>, response: IResponse, api: IApi): Promise<void> {
        this._assertExists(location);

        const model: Maybe<object> = await this._parseModel(content, location);

        if (!location.isEntity()) {
            throw new MethodNotAllowedException(Action.PUT, location);
        }

        const isCreate: boolean = !await this._db.exists(location);

        let oldModel: Maybe<object> = null;

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
            throw new MethodNotAllowedException(Action.DELETE, location);
        }

        const oldModel: any = await this._db.get(location);

        await this._db.delete(location);
        await this._updateRelationships(location, null, oldModel);

        response.noContent();
    }

    public async root(response: IResponse, api: IApi): Promise<void> {
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

    private async _updateRelationships(location: ResourceLocation, model: Maybe<object> = null, previousModel: Maybe<object> = null): Promise<void> {
        const newRelationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(model);
        const oldRelationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(previousModel);
        const added: Array<ResourceLocation> = newRelationships.filter((item: ResourceLocation) => {
            return oldRelationships.indexOf(item) === -1;
        });

        const removed: Array<ResourceLocation> = oldRelationships.filter((item: ResourceLocation) => {
            return newRelationships.indexOf(item) === -1;
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

    private _handleError(e: Error, response: IResponse): void {
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

    private async _parseModel(content: Maybe<IContent>, location: Maybe<ResourceLocation>): Promise<Maybe<object>> {
        if ($isNull(content)) {
            return null;
        }

        if ($isNull(location)) {
            throw new CannotParseModelWithNoLocationException();
        }

        const model: object = API_REGISTER.get(content.type).deserialise(content.raw, location);

        const validationIssues: ValidationExceptions = await SCHEMA_REGISTER.validate(model);

        if (validationIssues.length) {
            throw validationIssues;
        }

        return model;
    }

    private _assertExists(location: ResourceLocation): void {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }
    }

    private _authenticate(request: IRequest): void {
        if (!$isNull(this.authenticator)) {
            try {
                this.authenticator.authenticate(request);
            } catch (e) {
                throw new NotAuthorisedException();
            }
        }
    }

    private _getApi(request: IRequest): IApi {
        return API_REGISTER.get(request.type);
    }
}
