import { HttpRequest as AzureRequest } from '@azure/functions';
import { Maybe } from '@cleavera/utils';
import { ResourceLocation } from '@skimp/core';
import { HttpRequest } from '@skimp/http';
import { Content } from './content';

export class RequestFactory {
    public static async FromRequest(location: Maybe<ResourceLocation>, request: AzureRequest): Promise<HttpRequest> {
        const content: Maybe<Content> = Content.FromRequest(request);
        const origin: Maybe<string> = request.headers.origin || null;
        const type: Maybe<string> = request.headers.accept || null;
        const method: Maybe<string> = (request.method || '').toUpperCase();

        return new HttpRequest(location, method, content, origin, type);
    }
}
