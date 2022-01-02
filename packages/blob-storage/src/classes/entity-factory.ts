import { BlobServiceClient } from '@azure/storage-blob';
import { ResourceLocation } from '@skimp/core';
import { IEntityFactory } from '@skimp/json-file';

import { BlobLocation } from './blob-location';
import { Entity } from './entity';

export class EntityFactory implements IEntityFactory {
    public _client: BlobServiceClient;

    constructor(client: BlobServiceClient) {
        this._client = client;
    }

    public async fromPath(path: string): Promise<Entity> {
        return Entity.Create(this._client, BlobLocation.FromFilePath(path));
    }

    public parseResourceLocation(path: string): ResourceLocation {
        const resource: [string, string] = path.split('/') as [string, string];

        return new ResourceLocation(resource[0], resource[1].substring(0, resource[1].lastIndexOf('.')));
    }
}
