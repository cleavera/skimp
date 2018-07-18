import { IRequest, RequestMethod, Uri } from '@skimp/http';
import { $isNull, Maybe } from '@skimp/shared';
import { IncomingMessage } from 'http';

import { Content } from './content';

export class Request implements IRequest {
    public url: Uri;
    public content: Maybe<Content>;
    public readonly method: string;

    private _message: IncomingMessage;

    constructor(message: IncomingMessage, content: Maybe<Content> = null) {
        this._message = message;
        this.content = content;
        this.method = (this._message.method || '').toUpperCase();

        this.url = new Uri(message.url || '');
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

    public get accepts(): Maybe<string> {
        return this._message.headers.accept || null;
    }

    public get origin(): Maybe<string | Array<string>> {
        return this._message.headers.origin || null;
    }

    public get contentType(): Maybe<string> {
        return this._message.headers['content-type'] || null;
    }

    public static async fromIncomingMessage(message: IncomingMessage): Promise<Request> {
        const content: Maybe<Content> = await Content.fromStream(message);

        if ($isNull(content)) {
            return new Request(message);
        }

        return new Request(message, content);
    }
}
