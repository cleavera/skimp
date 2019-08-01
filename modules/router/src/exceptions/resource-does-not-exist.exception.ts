import { ResourceLocation } from '@skimp/core';

export class ResourceDoesNotExistException extends Error {
    public path: string;

    constructor(location: ResourceLocation) {
        super(`Resource ${location.toString()} does not exist`);
        this.path = location.toString();
    }
}
