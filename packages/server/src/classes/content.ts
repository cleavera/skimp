import { isEmpty, isNull } from '@cleavera/utils';
import { IContent } from '@skimp/core';
import { IncomingMessage } from 'http';

export class Content implements IContent {
    public readonly raw: string;
    public readonly type: string | null;

    constructor(raw: string, type: string | null = null) {
        this.raw = raw;
        this.type = type;
    }

    public static async fromStream(stream: IncomingMessage): Promise<Content | null> {
        return new Promise<Content | null>((resolve: (content: Content | null) => void, reject: (error: Error) => void): void => {
            let body: string = '';

            stream.on('readable', (): void => {
                const content: string | null = stream.read() ?? null;

                if (!isNull(content)) {
                    body += content;
                }
            });

            stream.on('end', (): void => {
                if (!isEmpty(body)) {
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
