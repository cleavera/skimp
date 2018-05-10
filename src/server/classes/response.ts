import { ServerResponse } from 'http';
import { Writable } from 'stream';
import { LOGGER } from '../../debug';
import { ResponseCode } from '../constants/response-code.constant';
import { ResponseType } from '../constants/response-types.constant';

export class Response {
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

    public get location(): string {
        return this._response.getHeader('location') as string || '';
    }

    public set location(location: string) {
        this._response.setHeader('location', location);
    }

    public get stream(): Writable {
        return this._response;
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
        LOGGER.exception(error);

        this.statusCode = ResponseCode.SERVER_ERROR;
        this._response.write(JSON.stringify(error));
        this._response.end();
    }
}
