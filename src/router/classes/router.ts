import { join } from 'path';
import * as $uuid from 'uuid/v4';
import { LOGGER } from '../../debug';
import { Entity } from '../../file-system';
import { Api } from '../../json-api/classes/api';
import { ISchema, SCHEMA_REGISTER } from '../../schema';
import { Serialiser } from '../../serialiser/classes/serialiser';
import { ISerialisationResult } from '../../serialiser/interfaces/serialisation-result.interface';
import { IRouter, Request, Response, Url } from '../../server';
import { MethodNotAllowedException } from '../exceptions/method-not-allowed.exception';
import { ResourceDoesNotExistException } from '../exceptions/resource-does-not-exist.exception';

export class Router implements IRouter {
    private _api: Api;

    constructor() {
        this._api = new Api();
    }

    public async route(request: Request, response: Response): Promise<void> {
        try {
            if (!SCHEMA_REGISTER.getSchema(request.url.resourceName)) {
                throw new ResourceDoesNotExistException(request);
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
            throw new ResourceDoesNotExistException(request);
        }

        const entity: Entity = await Entity.fromPath(path);

        if (!entity.exists()) {
            const filePath: string = path + '.json';
            const file: Entity = await Entity.fromPath(filePath);

            if (!file.exists()) {
                throw new ResourceDoesNotExistException(request);
            }

            const deserialised: ISerialisationResult = Serialiser.jsonFile().deserialise(await file.readContent());

            return this._api.respond(response, deserialised, Url.fromEntity(file));
        }

        if (entity.isDirectory()) {
            const files: Array<string> = await entity.listChildren();

            const models: Array<any> = files.map(async(filePath: string) => {
                const file: Entity = await Entity.fromPath(filePath);

                return Serialiser.jsonFile().deserialise(await file.readContent());
            });

            return this._api.respond(response, await Promise.all(models), Url.fromEntity(entity));
        }

        throw new ResourceDoesNotExistException(request);
    }

    private async _post(request: Request, response: Response): Promise<void> {
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(request.url.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(request);
        }

        const path: string = request.url.toString();
        const entity: Entity = await Entity.fromPath(path);

        if ((!entity.exists()) || (!entity.isDirectory())) {
            throw new ResourceDoesNotExistException(request);
        }

        const filePath: string = join(path, $uuid() + '.json');
        const file: Entity = await Entity.fromPath(filePath);

        await file.write(Serialiser.jsonFile().serialise(this._api.deserialise(request.content.json()), Url.fromEntity(file)));

        this._api.respond(response, Serialiser.jsonFile().deserialise(await file.readContent()), Url.fromEntity(file), true);
    }

    private async _put(request: Request, response: Response): Promise<void> {
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(request.url.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(request);
        }

        const path: string = request.url.toString();

        const entity: Entity = await Entity.fromPath(path);

        if (entity.exists()) {
            throw new MethodNotAllowedException(request);
        }

        const parentPath: string = request.url.dirName;
        const filePath: string = request.url.toString() + '.json';
        const directory: Entity = await Entity.fromPath(parentPath);

        if ((!directory.exists()) || (!directory.isDirectory())) {
            throw new ResourceDoesNotExistException(request);
        }

        const file: Entity = await Entity.fromPath(filePath);
        const isCreate: boolean = file.exists();

        await file.write(Serialiser.jsonFile().serialise(this._api.deserialise(request.content.json), Url.fromEntity(file)));

        this._api.respond(response, Serialiser.jsonFile().deserialise(await file.readContent()), Url.fromEntity(file), isCreate);
    }

    private async _delete(request: Request, response: Response): Promise<void> {
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(request.url.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(request);
        }

        const entity: Entity = await Entity.fromPath(request.url.toString());

        if (entity.exists() && entity.isDirectory()) {
            throw new MethodNotAllowedException(request);
        }

        const filePath: string = request.url.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(request);
        }

        await file.delete();

        response.noContent();
    }
}
