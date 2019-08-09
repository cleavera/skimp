import { Maybe } from '@cleavera/utils';
import { ResourceLocation } from '@skimp/core';
import { HttpRequest } from '@skimp/http';
import { IncomingHttpHeaders, IncomingMessage } from 'http';

import { Content } from './content';
import { LocationFactory } from './location.factory';

export class RequestFactory {
    public static async FromIncomingMessage(message: IncomingMessage): Promise<HttpRequest> {
        const content: Maybe<Content> = await Content.fromStream(message);
        const location: Maybe<ResourceLocation> = LocationFactory.FromUrl(message.url || '');
        const { origin, accept }: IncomingHttpHeaders = message.headers;
        const method: string = (message.method || '').toUpperCase();

        return new HttpRequest(location, method, content, origin, accept);
    }
}
