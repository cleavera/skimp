import { ServerResponse } from 'http';
import { Writable } from 'stream';
import { logger } from '../../debug';
import { Entity } from '../../file-system';
import { ResponseType } from '../constants/response-types.constant';

export class Response {
    private readonly _response: ServerResponse;

    constructor(response: ServerResponse) {
        this._response = response;
    }

    public setHeader(key: string, value: number | string | Array<string>): void {
        this._response.setHeader(key, value);
    }

    public get statusCode(): number {
        return this._response.statusCode;
    }

    public set statusCode(code: number) {
        this._response.statusCode = code;
    }

    public get stream(): Writable {
        return this._response;
    }

    public async file(file: Entity, statusCode: number = 200, contentType: ResponseType = ResponseType.TEXT): Promise<void> {
        this.statusCode = statusCode;
        this._response.setHeader('Content-Type', contentType);

        await file.streamTo(this.stream);
        this._response.end();
    }

    public async dir(directory: Entity, statusCode: number = 200): Promise<void> {
        this.statusCode = statusCode;
        this._response.setHeader('Content-Type', ResponseType.JSON);

        const files: Array<string> = await directory.listChildren();
        const promises: Array<Promise<any>> = []; // tslint:disable-line no-any

        files.forEach((filePath: string) => {
            promises.push((async() => {
                const file: Entity = await Entity.fromPath(filePath);

                return await file.readJSON();
            })());
        });

        this._response.write(JSON.stringify(await Promise.all(promises)));
        this._response.end();
    }

    public notFound(): void {
        this.statusCode = 404;
        this._response.write('');
        this._response.end();
    }

    public methodNotAllowed(): void {
        this.statusCode = 405;
        this._response.write('');
        this._response.end();
    }

    public noContent(): void {
        this.statusCode = 204;
        this._response.end();
    }

    public serverError(error: Error): void {
        logger.exception(error);

        this.statusCode = 500;
        this._response.write(JSON.stringify(error));
        this._response.end();
    }
}
