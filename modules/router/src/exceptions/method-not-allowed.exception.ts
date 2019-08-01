import { ResourceLocation } from '@skimp/core';
import { RequestMethod } from '@skimp/http';

export class MethodNotAllowedException extends Error {
    constructor(method: RequestMethod, url: ResourceLocation) {
        super(`"${method}" not allowed at "${url.toString()}"`);
    }
}
