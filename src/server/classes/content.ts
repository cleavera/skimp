import { Readable } from 'stream';
import { Nullable } from '../../shared';

export class Content {
    public readonly raw: string;

    constructor(raw: string) {
        this.raw = raw;
    }

    public json<T = any>(): T { // tslint:disable-line no-any
        return JSON.parse(this.raw);
    }

    public static async fromStream(stream: Readable): Promise<Nullable<Content>> {
        return new Promise<Nullable<Content>>((resolve: (content: Nullable<Content>) => void, reject: (bodyReadError: Error) => void): void => {
            let body: string = '';

            stream.on('readable', () => {
                const content: string = stream.read();

                if (content) {
                    body += content;
                }
            });

            stream.on('end', () => {
                if (body) {
                    resolve(new Content(body));
                }

                resolve(void 0);
            });

            stream.on('error', (bodyReadError: Error) => {
                reject(bodyReadError);
            });
        });
    }
}
