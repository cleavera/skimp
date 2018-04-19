import { join } from 'path';
import { logger } from '../../debug';
import { Entity } from '../../file-system';
import { IRouter, Request, Response, ResponseType } from '../../server';
import { ResourceDoesNotExistException } from '../exceptions/resource-does-not-exist.exception';

const DATA_PATH: string = require('../../../data/path');

export class Router implements IRouter {
    public async route(request: Request, response: Response): Promise<void> {
        try {
            if (request.isGet) {
                return await this._get(request, response);
            } else if (request.isPut) {
                return await this._put(request, response);
            } else if (request.isDelete) {
                return await this._delete(request, response);
            } else {
                response.methodNotAllowed();
            }
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                logger.warn(e.message);
                response.notFound();
            } else {
                throw e;
            }
        }
    }

    private async _get(request: Request, response: Response): Promise<void> {
        const path: string = join(DATA_PATH, request.url.toString());

        const entity: Entity = await Entity.fromPath(path);

        if (!entity.exists()) {
            const filePath: string = path + '.json';
            const file: Entity = await Entity.fromPath(filePath);

            if (!file.exists()) {
                throw new ResourceDoesNotExistException(request);
            }

            return await response.file(file, 200, ResponseType.JSON);
        }

        if (entity.isDirectory()) {
            return await response.dir(entity, 200);
        }

        throw new ResourceDoesNotExistException(request);
    }

    private async _put(request: Request, response: Response): Promise<void> {
        const path: string = join(DATA_PATH, request.url.dirName);
        const filePath: string = join(DATA_PATH, request.url.toString() + '.json');
        const directory: Entity = await Entity.fromPath(path);

        if ((!directory.exists()) || (!directory.isDirectory())) {
            throw new ResourceDoesNotExistException(request);
        }

        const file: Entity = await Entity.fromPath(filePath);

        await file.write(request.content.raw);
        await response.file(file, file.exists() ? 200 : 201, ResponseType.JSON);
    }

    private async _delete(request: Request, response: Response): Promise<void> {
        const filePath: string = join(DATA_PATH, request.url.toString() + '.json');
        const entity: Entity = await Entity.fromPath(filePath);

        if (!entity.exists()) {
            throw new ResourceDoesNotExistException(request);
        }

        await entity.delete();

        response.noContent();
    }
}
