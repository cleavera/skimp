import { HttpRequest as AzureRequest } from '@azure/functions';
import { ResourceLocation } from '@skimp/core';
import { HttpRequest } from '@skimp/http';

import { Content } from './content';

export class RequestFactory {
    public static FromRequest(location: ResourceLocation | null, request: AzureRequest): HttpRequest {
        const content: Content | null = Content.FromRequest(request);
        const origin: string | null = request.headers.origin ?? null;
        const type: string | null = request.headers.accept ?? null;
        const authorisation: string | null = request.headers.authorization ?? null;
        const method: string | null = (request.method ?? '').toUpperCase();

        return new HttpRequest(location, method, content, origin, type, authorisation);
    }
}
