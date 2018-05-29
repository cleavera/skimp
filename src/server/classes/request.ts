import { IncomingMessage } from 'http';
import { Maybe } from '../../shared';
import { RequestMethod } from '../constants/request-method.constant';
import { Content } from './content';
import { Url } from './url';

export class Request {
    public url: Url;
    public content: Maybe<Content>;
    public readonly method: string;
    private _message: IncomingMessage;

    constructor(message: IncomingMessage, content?: Content) {
        this._message = message;
        this.content = content;
        this.method = (this._message.method || '').toUpperCase();

        this.url = new Url(message.url || '');
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

    public get accepts(): Maybe<string> {
        return this._message.headers.accept;
    }

    public get contentType(): Maybe<string> {
        return this._message.headers['content-type'];
    }

    public static async fromIncomingMessage(message: IncomingMessage): Promise<Request> {
        const content: Maybe<Content> = await Content.fromStream(message);

        if (content) {
            return new Request(message, content);
        }

        return new Request(message);
    }
}
