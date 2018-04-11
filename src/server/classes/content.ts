import { Readable } from 'stream';

export class Content {
    public readonly raw: string;

    constructor(raw: string) {
        this.raw = raw;
    }

    public json<T = any>(): T { // tslint:disable-line no-any
        return JSON.parse(this.raw);
    }

    public static async fromStream(stream: Readable): Promise<Content> {
        return new Promise<Content>((resolve: (content: Content) => void, reject: (bodyReadError: Error) => void): void => {
            let body: string = '';

            stream.on('readable', () => {
                const content: string = stream.read();

                if (content) {
                    body += content;
                }
            });

            stream.on('end', () => {
                resolve(new Content(body));
            });

            stream.on('error', (bodyReadError: Error) => {
                reject(bodyReadError);
            });
        });
    }
}
