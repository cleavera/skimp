import { $isNull, IDict, Maybe } from '@cleavera/utils';
import { IRequest, ResourceLocation } from '@skimp/core';
import { RequestMethod } from '@skimp/http';
import { IncomingMessage } from 'http';

import { Content } from './content';
import { LocationFactory } from './location.factory';

export class Request implements IRequest {
    public location: Maybe<ResourceLocation>;
    public content: Maybe<Content>;
    public readonly method: string;

    private readonly _headers: IDict<string>;

    private constructor(location: Maybe<ResourceLocation>, headers: IDict<string>, method: string, content: Maybe<Content> = null) {
        this._headers = headers;
        this.content = content;
        this.method = method;

        this.location = location;
    }

    public get isGet(): boolean {
        if (!this.method) {
            return true;
        }

        return this.method === RequestMethod.GET;
    }

    public get isPut(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === RequestMethod.PUT;
    }

    public get isPost(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === RequestMethod.POST;
    }

    public get isDelete(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === RequestMethod.DELETE;
    }

    public get isOptions(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === RequestMethod.OPTIONS;
    }

    public get type(): Maybe<string> {
        return this._headers.accept || null;
    }

    public get origin(): Maybe<string | Array<string>> {
        return this._headers.origin || null;
    }
    public static async fromIncomingMessage(message: IncomingMessage): Promise<Request> {
        const content: Maybe<Content> = await Content.fromStream(message);
        const location: Maybe<ResourceLocation> = LocationFactory.FromUrl(message.url || '');

        if ($isNull(content)) {
            return new Request(location, message.headers as IDict<string>, (message.method || '').toUpperCase());
        }

        return new Request(location, message.headers as IDict<string>, (message.method || '').toUpperCase(), content);
    }
}
