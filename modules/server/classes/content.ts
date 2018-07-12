import { Readable } from 'stream';

import { Maybe } from '../../core';
import { IContent } from '../../http';

export class Content implements IContent {
    public readonly raw: string;

    constructor(raw: string) {
        this.raw = raw;
    }

    public json<T = any>(): T { // tslint:disable-line no-any
        return JSON.parse(this.raw);
    }

    public static async fromStream(stream: Readable): Promise<Maybe<Content>> {
        return new Promise<Maybe<Content>>((resolve: (content: Maybe<Content>) => void, reject: (bodyReadError: Error) => void): void => {
            let body: string = '';

            stream.on('readable', (): void => {
                const content: string = stream.read();

                if (content) {
                    body += content;
                }
            });

            stream.on('end', (): void => {
                if (body) {
                    resolve(new Content(body));
                }

                resolve(null);
            });

            stream.on('error', (bodyReadError: Error): void => {
                reject(bodyReadError);
            });
        });
    }
}
