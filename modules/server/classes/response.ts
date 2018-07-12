import { ServerResponse } from 'http';
import { Writable } from 'stream';

import { LOGGER } from '../../debug';
import { IResponse, ResponseCode, ResponseType } from '../../http';

export class Response implements IResponse {
    private readonly _response: ServerResponse;

    constructor(response: ServerResponse) {
        this._response = response;
    }

    public get statusCode(): number {
        return this._response.statusCode;
    }

    public set statusCode(code: number) {
        this._response.statusCode = code;
    }

    public get corsHeader(): string | Array<string> {
        return this._response.getHeader('Access-Control-Allow-Origin') as string | Array<string> || '';
    }

    public set corsHeader(cors: string | Array<string>) {
        this._response.setHeader('Access-Control-Allow-Origin', cors);
        this._response.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        this._response.setHeader('Access-Control-Max-Age', 86400);
        this._response.setHeader('Access-Control-Allow-Credentials', 'true');
        this._response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    public get location(): string {
        return this._response.getHeader('location') as string || '';
    }

    public set location(location: string) {
        this._response.setHeader('location', location);
    }

    public get stream(): Writable {
        return this._response;
    }

    public setAllow(post: boolean, put: boolean, remove: boolean): void {
        const allowed: Array<string> = ['GET'];

        if (post) {
            allowed.push('POST');
        }

        if (put) {
            allowed.push('PUT');
        }

        if (remove) {
            allowed.push('DELETE');
        }

        this._response.setHeader('Allow', allowed);
    }

    public commit(): void {
        this._response.end();
    }

    public json(obj: any, contentType: ResponseType = ResponseType.JSON): void {
        this._response.setHeader('Content-Type', contentType);
        this._response.write(JSON.stringify(obj));
    }

    public async text(text: string, statusCode: ResponseCode = ResponseCode.OKAY, contentType: ResponseType = ResponseType.TEXT): Promise<void> {
        this.statusCode = statusCode;
        this._response.setHeader('Content-Type', contentType);
        this._response.write(text);
        this._response.end();
    }

    public noContent(): void {
        this.statusCode = ResponseCode.NO_CONTENT;
        this._response.end();
    }

    public serverError(error: Error): void {
        LOGGER.error(error);

        this.statusCode = ResponseCode.SERVER_ERROR;
        this._response.write(JSON.stringify(error));
        this._response.end();
    }
}
