import { join } from 'path';
import * as $uuid from 'uuid/v4';
import { LOGGER } from '../../debug';
import { Entity } from '../../file-system';
import { Api } from '../../json-api/classes/api';
import { Db } from '../../json-file/classes/db';
import { ISchema, SCHEMA_REGISTER } from '../../schema';
import { IRouter, Request, Response, Url } from '../../server';
import { MethodNotAllowedException } from '../exceptions/method-not-allowed.exception';
import { ResourceDoesNotExistException } from '../exceptions/resource-does-not-exist.exception';

export class Router implements IRouter {
    private _api: Api;
    private _db: Db;

    constructor() {
        this._api = new Api();
        this._db = new Db();
    }

    public async route(request: Request, response: Response): Promise<void> {
        try {
            if (!SCHEMA_REGISTER.getSchema(request.url.resourceName)) {
                throw new ResourceDoesNotExistException(request.url);
            }

            if (request.isGet) {
                return await this._get(request, response);
            } else if (request.isPut) {
                return await this._put(request, response);
            } else if (request.isPost) {
                return await this._post(request, response);
            } else if (request.isDelete) {
                return await this._delete(request, response);
            } else {
                throw new MethodNotAllowedException(request);
            }
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                LOGGER.warn(e.message);
                response.notFound();
            } else if (e instanceof MethodNotAllowedException) {
                LOGGER.warn(e.message);
                response.methodNotAllowed();
            } else {
                throw e;
            }
        }
    }

    private async _get(request: Request, response: Response): Promise<void> {
        const path: string = request.url.toString();
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(request.url.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(request.url);
        }

        const entity: Entity = await Entity.fromPath(path);

        if (request.url.resourceId) {
            return this._api.respond(response, await this._db.get(request.url), request.url);
        }

        return this._api.respond(response, await this._db.list(request.url), Url.fromEntity(entity));
    }

    private async _post(request: Request, response: Response): Promise<void> {
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(request.url.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(request.url);
        }

        if (request.url.resourceId) {
            throw new MethodNotAllowedException(request);
        }

        const path: string = request.url.toString();
        const resourcePath: string = join(path, $uuid());
        const filePath: string = resourcePath + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        await this._db.set(Url.fromEntity(file), this._api.deserialise(request.content.json()));

        this._api.respond(response, await this._db.get(new Url(resourcePath)), Url.fromEntity(file), true);
    }

    private async _put(request: Request, response: Response): Promise<void> {
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(request.url.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(request.url);
        }

        if (!request.url.resourceId) {
            throw new MethodNotAllowedException(request);
        }

        const filePath: string = request.url.toString() + '.json';

        const file: Entity = await Entity.fromPath(filePath);
        const isCreate: boolean = !file.exists();

        await this._db.set(Url.fromEntity(file), this._api.deserialise(request.content.json()));

        this._api.respond(response, await this._db.get(request.url), Url.fromEntity(file), isCreate);
    }

    private async _delete(request: Request, response: Response): Promise<void> {
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(request.url.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(request.url);
        }

        if (!request.url.resourceId) {
            throw new MethodNotAllowedException(request);
        }

        await this._db.delete(request.url);

        response.noContent();
    }
}
