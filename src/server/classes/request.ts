import { IncomingMessage } from 'http';
import { ResponseMethod } from '../constants/response-methods.constant';
import { Content } from './content';
import { Url } from './url';

export class Request {
    public url: Url;
    public content: Content | void;
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

        return this.method === ResponseMethod.GET;
    }

    public get isPut(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === ResponseMethod.PUT;
    }

    public get isPost(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === ResponseMethod.POST;
    }

    public get isDelete(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === ResponseMethod.DELETE;
    }

    public static async fromIncomingMessage(message: IncomingMessage): Promise<Request> {
        const content: Content | void = await Content.fromStream(message);

        if (content) {
            return new Request(message, content);
        }

        return new Request(message);
    }
}
