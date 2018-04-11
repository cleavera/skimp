import { IncomingMessage } from 'http';
import { Content } from './content';
import { Url } from './url';

export class Request {
    public url: Url;
    public content: Content;
    private _message: IncomingMessage;

    constructor(message: IncomingMessage, content: Content) {
        this._message = message;
        this.content = content;

        this.url = new Url(message.url || '');
    }

    public get isGet(): boolean {
        if (!this._message.method) {
            return true;
        }

        return this._message.method.toUpperCase() === 'GET';
    }

    public get isPut(): boolean {
        if (!this._message.method) {
            return false;
        }

        return this._message.method.toUpperCase() === 'PUT';
    }

    public get isDelete(): boolean {
        if (!this._message.method) {
            return false;
        }

        return this._message.method.toUpperCase() === 'DELETE';
    }

    public static async fromIncomingMessage(message: IncomingMessage): Promise<Request> {
        const content: Content = await Content.fromStream(message);

        return new Request(message, content);
    }
}
