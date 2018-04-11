import { accessSync, constants as ACCESS_CONSTANTS, lstat, Stats, unlink, writeFile } from 'fs';
import { join } from 'path';
import { IRouter, Request, Response, ResponseType } from '../../server';

const DATA_PATH: string = require('../../../data/path');

export class Router implements IRouter {
    public async route(request: Request, response: Response): Promise<void> {
        if (request.isGet) {
            return this._get(request, response);
        } else if (request.isPut) {
            return this._put(request, response);
        } else if (request.isDelete) {
            return this._delete(request, response);
        } else {
            response.methodNotAllowed();
        }
    }

    private async _get(request: Request, response: Response): Promise<void> {
        const path: string = join(DATA_PATH, request.url.toString());

        return new Promise<void>( async(resolve: () => void, reject: () => void): Promise<void> => {
            lstat(path, async(err: Error, stats: Stats): Promise<void> => {
                if (err) {
                    const filePath: string = path + '.json';

                    try {
                        await response.file(filePath, 200, ResponseType.JSON);
                    } catch (e) {
                        reject();
                    }

                    resolve();

                    return;
                }

                if (stats.isDirectory()) {
                    console.log('Is directory');
                } else {
                    response.notFound();
                }
            });
        });
    }

    private async _put(request: Request, response: Response): Promise<void> {
        const path: string = join(DATA_PATH, request.url.dirName);
        const filePath: string = join(DATA_PATH, request.url.toString() + '.json');

        return new Promise<void>( async(resolve: () => void, reject: () => void): Promise<void> => {
            lstat(path, async(err: Error, stats: Stats): Promise<void> => {
                if (err || !stats.isDirectory()) {
                    response.notFound();
                    reject();

                    return;
                }

                let exists: boolean = true;

                try {
                    accessSync(path, ACCESS_CONSTANTS.F_OK);
                } catch (e) {
                    exists = false;
                }

                writeFile(filePath, request.content.raw, 'utf-8', async(writeError: Error) => {
                    if (writeError) {
                        response.serverError(writeError);
                        reject();

                        return;
                    }

                    try {
                        await response.file(filePath, exists ? 200 : 201, ResponseType.JSON);
                    } catch (e) {
                        reject();
                    }

                    resolve();
                });

                resolve();
            });
        });
    }

    private async _delete(request: Request, response: Response): Promise<void> {
        return new Promise<void>( async(resolve: () => void, reject: () => void): Promise<void> => {
            const filePath: string = join(DATA_PATH, request.url.toString() + '.json');

            lstat(filePath, async(err: Error, stats: Stats): Promise<void> => {
                if (err || !stats.isFile()) {
                    response.notFound();
                    reject();

                    return;
                }

                unlink(filePath, (error: Error) => {
                    if (error) {
                        response.serverError(error);
                        reject();

                        return;
                    }

                    response.noContent();
                    resolve();
                });
            });
        });
    }
}
