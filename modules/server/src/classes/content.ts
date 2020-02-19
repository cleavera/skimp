import { IPromiseRejector, Maybe } from '@cleavera/utils';
import { IPromiseResolverWithValue } from '@cleavera/utils/dist/interfaces/promise-resolver.interface';
import { IContent } from '@skimp/core';
import { IncomingMessage } from 'http';

export class Content implements IContent {
    public readonly raw: string;
    public readonly type: Maybe<string>;

    constructor(raw: string, type: Maybe<string> = null) {
        this.raw = raw;
        this.type = type;
    }

    public static fromStream(stream: IncomingMessage): Promise<Maybe<Content>> {
        return new Promise<Maybe<Content>>((resolve: IPromiseResolverWithValue<Maybe<Content>>, reject: IPromiseRejector): void => {
            let body: string = '';

            stream.on('readable', (): void => {
                const content: string = stream.read();

                if (content) {
                    body += content;
                }
            });

            stream.on('end', (): void => {
                if (body) {
                    resolve(new Content(body, stream.headers['content-type']));
                }

                resolve(null);
            });

            stream.on('error', (bodyReadError: Error): void => {
                reject(bodyReadError);
            });
        });
    }
}
