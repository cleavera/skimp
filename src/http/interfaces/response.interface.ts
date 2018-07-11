import { Writable } from 'stream';
import { ResponseCode } from '../constants/response-code.constant';
import { ResponseType } from '../constants/response-types.constant';

export interface IResponse {
    statusCode: number;
    corsHeader: string | Array<string>;
    location: string;
    stream: Writable;

    setAllow(post: boolean, put: boolean, remove: boolean): void;

    commit(): void;

    json(obj: any, contentType?: ResponseType): void;

    text(text: string, statusCode?: ResponseCode, contentType?: ResponseType): Promise<void>;

    noContent(): void;

    serverError(error: Error): void;
}
