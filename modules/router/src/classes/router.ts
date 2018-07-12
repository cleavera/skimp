import * as $uuid from 'uuid/v4';

import { API_REGISTER, ContentTypeNotSupportedException, DB_REGISTER, IApi, IDb, MODEL_REGISTER, ResourceLocation } from '../../../core/src/index';
import { LOGGER } from '../../../debug/src/index';
import { IRequest, IResponse, RequestMethod, ResponseCode } from '../../../http/src/index';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException, ValidationException, ValidationExceptions } from '../../../schema/src/index';
import { IRouter } from '../../../server/src/index';
import { Maybe } from '../../../shared/src';

import { MethodNotAllowedException } from '../exceptions/method-not-allowed.exception';
import { NotAuthorisedException } from '../exceptions/not-authorised.exception';
import { ResourceDoesNotExistException } from '../exceptions/resource-does-not-exist.exception';
import { IAuthenticator } from '../interfaces/authenticator.interface';
import { RootSchema } from '../schemas/root.schema';

export class Router implements IRouter {
    public version: string;
    public cors: string | boolean | Array<string>;
    public authenticator: Maybe<IAuthenticator>;

    private _db: IDb;

    constructor(version: string, cors: string | boolean | Array<string>, authenticator: Maybe<IAuthenticator> = null) {
        this.authenticator = authenticator;
        this._db = DB_REGISTER.get();
        this.cors = cors;
        this.version = version;
    }

    public async route(request: IRequest, response: IResponse): Promise<void> {
        try {
            const api: IApi = API_REGISTER.get(request.accepts);

            if (this.authenticator) {
                try {
                    this.authenticator.authenticate(request);
                } catch (e) {
                    throw new NotAuthorisedException();
                }
            }

            if (request.url.toString() === '/') {
                await this._root(response, api);

                return;
            }

            if (!SCHEMA_REGISTER.getSchema(request.url.resourceName)) {
                throw new ResourceDoesNotExistException(request.url);
            }

            const location: ResourceLocation = ResourceLocation.fromUrl(request.url);
            let model: any = null;

            if (request.content) {
                model = API_REGISTER.get(request.contentType).deserialise(request.content.json(), location);

                const validationIssues: ValidationExceptions = await SCHEMA_REGISTER.validate(model);

                if (validationIssues.length) {
                    throw validationIssues;
                }
            }

            this._assignCors(request, response);

            if (request.isGet) {
                await this._get(location, response, api);

                return;
            } else if (request.isPut) {
                await this._put(location, model, response, api);

                return;
            } else if (request.isPost) {
                await this._post(location, model, response, api);

                return;
            } else if (request.isDelete) {
                await this._delete(location, response);

                return;
            } else if (request.isOptions) {
                await this._options(location, response);

                return;
            } else {
                throw new MethodNotAllowedException(request.method as RequestMethod, request.url);
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

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        if (location.resourceId) {
            api.respond(response, await this._db.get(location), location);

            return;
        }

        api.respond(response, await this._db.list(location), location);
    }

    private async _post(location: ResourceLocation, model: any, response: IResponse, api: IApi): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

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

        const createdLocation: ResourceLocation = new ResourceLocation(location.resourceName, $uuid());

        await this._db.set(createdLocation, model);
        await this._updateRelationships(createdLocation, model);

        api.respond(response, await this._db.get(createdLocation), location, true);
    }

    private async _put(location: ResourceLocation, model: any, response: IResponse, api: IApi): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

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

        api.respond(response, await this._db.get(location), location, isCreate);
    }

    private async _delete(location: ResourceLocation, response: IResponse): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

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

    private async _options(location: ResourceLocation, response: IResponse): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
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

    private _assignCors(request: IRequest, response: IResponse): void {
        if (this.cors === false) {
            return;
        } else if (this.cors === true) {
            response.corsHeader = request.origin || '*';
        } else {
            response.corsHeader = this.cors;
        }
    }
}