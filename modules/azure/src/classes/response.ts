import { Context } from '@azure/functions';
import { $isUndefined } from '@cleavera/utils';
import { ResponseCode } from '@skimp/core';
import { LOGGER } from '@skimp/debug';
import { IHttpResponse, ResponseType } from '@skimp/http';

import { RequestNotHttpTriggerException } from '../exceptions/request-not-http-trigger.exception';
import { IResponse } from '../interfaces/response.interface';

export class Response implements IHttpResponse {
    private readonly _context: Context;
    private readonly _res: IResponse;

    constructor(response: IResponse, context: Context) {
        this._context = context;
        this._res = response;
    }

    public get statusCode(): number {
        return this._res.status;
    }

    public set statusCode(code: number) {
        this._res.status = code;
    }

    public get corsHeader(): string | Array<string> {
        return this._res.headers['Access-Control-Allow-Origin'] as string | Array<string> ?? '';
    }

    public set corsHeader(cors: string | Array<string>) {
        this._res.headers['Access-Control-Allow-Origin'] = cors;
        this._res.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS';
        this._res.headers['Access-Control-Max-Age'] = 86400;
        this._res.headers['Access-Control-Allow-Credentials'] = 'true';
        this._res.headers['Access-Control-Allow-Headers'] = 'Content-Type';
    }

    public get location(): string {
        return this._res.headers.location as string ?? '';
    }

    public set location(location: string) {
        this._res.headers.location = location;
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

        this._res.headers.Allow = allowed;
    }

    public commit(): void {
        this._context.done();
    }

    public write(text: string, contentType: ResponseType = ResponseType.TEXT): void {
        this._res.headers['Content-Type'] = contentType;
        this._res.body = text;
        this._res.isRaw = true;
    }

    public noContent(): void {
        this.statusCode = ResponseCode.NO_CONTENT;
        this.commit();
    }

    public error(error: Error): void {
        LOGGER.error(error);

        this.statusCode = ResponseCode.SERVER_ERROR;
        this._res.body = JSON.stringify(error);
        this._res.isRaw = true;
        this._context.done();
    }

    public static FromContext(context: Context): Response {
        if ($isUndefined(context.res)) {
            throw new RequestNotHttpTriggerException();
        }

        return new Response(context.res as IResponse, context);
    }
}
