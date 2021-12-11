import { HttpRequest } from '@azure/functions';
import { Maybe } from '@cleavera/utils';
import { IContent } from '@skimp/core';

export class Content implements IContent {
    public readonly raw: string;
    public readonly type: Maybe<string>;

    constructor(raw: string, type: Maybe<string> = null) {
        this.raw = raw;
        this.type = type;
    }

    public static FromRequest(request: HttpRequest): Content {
        return new Content(request.rawBody, request.headers['content-type']);
    }
}
