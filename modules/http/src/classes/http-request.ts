import { $isEmpty, $isNull, Maybe } from '@cleavera/utils';
import { IContent, ResourceLocation } from '@skimp/core';

import { RequestMethod } from '../constants/request-method.constant';

export class HttpRequest {
    public location: Maybe<ResourceLocation>;
    public content: Maybe<IContent>;
    public readonly method: Maybe<string>;
    public readonly origin: Maybe<string | Array<string>>;
    public readonly type: Maybe<string>;

    constructor(location: Maybe<ResourceLocation>, method: Maybe<string> = null, content: Maybe<IContent> = null, origin: Maybe<string | Array<string>> = null, type: Maybe<string> = null) {
        this.content = content;
        this.method = method;
        this.origin = origin;
        this.type = type;

        this.location = location;
    }

    public get isGet(): boolean {
        if ($isNull(this.method) || $isEmpty(this.method)) {
            return true;
        }

        return this.method === RequestMethod.GET;
    }

    public get isPut(): boolean {
        if ($isNull(this.method) || $isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.PUT;
    }

    public get isPost(): boolean {
        if ($isNull(this.method) || $isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.POST;
    }

    public get isDelete(): boolean {
        if ($isNull(this.method) || $isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.DELETE;
    }

    public get isOptions(): boolean {
        if ($isNull(this.method) || $isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.OPTIONS;
    }
}
