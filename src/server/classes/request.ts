import { IncomingMessage } from 'http';
import { Content } from './content';
import { Url } from './url';

export class Request {
    public url: Url;
    public content: Content;
    public readonly method: string;
    private _message: IncomingMessage;

    constructor(message: IncomingMessage, content: Content) {
        this._message = message;
        this.content = content;
        this.method = (this._message.method || '').toUpperCase();

        this.url = new Url(message.url || '');
    }

    public get isGet(): boolean {
        if (!this.method) {
            return true;
        }

        return this.method === 'GET';
    }

    public get isPut(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === 'PUT';
    }

    public get isPost(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === 'POST';
    }

    public get isDelete(): boolean {
        if (!this.method) {
            return false;
        }

        return this.method === 'DELETE';
    }

    public static async fromIncomingMessage(message: IncomingMessage): Promise<Request> {
        const content: Content = await Content.fromStream(message);

        return new Request(message, content);
    }
}
