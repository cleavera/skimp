import { isEmpty, isNull } from '@cleavera/utils';
import { IContent, ResourceLocation } from '@skimp/core';

import { RequestMethod } from '../constants/request-method.constant';

export class HttpRequest {
    public location: ResourceLocation | null;
    public content: IContent | null;
    public readonly method: string | null;
    public readonly origin: string | Array<string> | null;
    public readonly type: string | null;

    constructor(location: ResourceLocation | null, method: string | null = null, content: IContent | null = null, origin: string | Array<string> | null = null, type: string | null = null) {
        this.content = content;
        this.method = method;
        this.origin = origin;
        this.type = type;

        this.location = location;
    }

    public get isGet(): boolean {
        if (isNull(this.method) || isEmpty(this.method)) {
            return true;
        }

        return this.method === RequestMethod.GET;
    }

    public get isPut(): boolean {
        if (isNull(this.method) || isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.PUT;
    }

    public get isPost(): boolean {
        if (isNull(this.method) || isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.POST;
    }

    public get isDelete(): boolean {
        if (isNull(this.method) || isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.DELETE;
    }

    public get isOptions(): boolean {
        if (isNull(this.method) || isEmpty(this.method)) {
            return false;
        }

        return this.method === RequestMethod.OPTIONS;
    }
}
