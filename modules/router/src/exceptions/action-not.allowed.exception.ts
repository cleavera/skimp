import { ResourceLocation } from '@skimp/core';
import { Action } from '../constants/action.contant';

export class ActionNotAllowedException extends Error {
    constructor(method: Action, url: ResourceLocation) {
        super(`"${method}" not allowed at "${url.toString()}"`);
    }
}
