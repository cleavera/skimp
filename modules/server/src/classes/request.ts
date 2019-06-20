import { $isNull, IDict, Maybe } from '@cleavera/utils';
import { IRequest, RequestMethod, Uri } from '@skimp/http';
import { IncomingMessage } from 'http';

import { Content } from './content';

export class Request implements IRequest {
    public url: Uri;
    public content: Maybe<Content>;
    public readonly method: string;

    private readonly _headers: IDict<string>;

    private constructor(uri: Uri, headers: IDict<string>, method: string, content: Maybe<Content> = null) {
        this._headers = headers;
        this.content = content;
        this.method = method;

        this.url = uri;
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
        return this._headers.accept || null;
    }

    public get origin(): Maybe<string | Array<string>> {
        return this._headers.origin || null;
    }

    public get contentType(): Maybe<string> {
        return this._headers['content-type'] || null;
    }

    public static async fromIncomingMessage(message: IncomingMessage): Promise<Request> {
        const content: Maybe<Content> = await Content.fromStream(message);
        const uri: Uri = new Uri(message.url || '');

        if ($isNull(content)) {
            return new Request(uri, message.headers as IDict<string>, (message.method || '').toUpperCase());
        }

        return new Request(uri, message.headers as IDict<string>, (message.method || '').toUpperCase(), content);
    }
}
