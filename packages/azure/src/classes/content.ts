import { HttpRequest } from '@azure/functions';
import { IContent } from '@skimp/core';

export class Content implements IContent {
    public readonly raw: string;
    public readonly type: string | null;

    constructor(raw: string, type: string | null = null) {
        this.raw = raw;
        this.type = type;
    }

    public static FromRequest(request: HttpRequest): Content {
        return new Content(request.rawBody, request.headers['content-type']);
    }
}
