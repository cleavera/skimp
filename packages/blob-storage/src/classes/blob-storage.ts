import { BlobServiceClient } from '@azure/storage-blob';
import { isNull } from '@cleavera/utils';
import { Db } from '@skimp/json-file';
import { InvalidSchemaResourceNameException, SCHEMA_REGISTER } from '@skimp/schema';

import { EntityFactory } from './entity-factory';

export class BlobStorage {
    private readonly _entityFactory: EntityFactory;
    private readonly _client: BlobServiceClient;

    private constructor(client: BlobServiceClient) {
        this._client = client;
        this._entityFactory = new EntityFactory(this._client);
    }

    public async createDb(): Promise<Db> {
        await this._initialise();

        return Db.create(this._entityFactory);
    }

    public async _initialise(): Promise<void> {
        const containers: Array<string> = [];

        for await (const container of this._client.listContainers()) {
            containers.push(container.name);
        }

        for (const schema of SCHEMA_REGISTER.schemas) {
            const resourceName: string | null = SCHEMA_REGISTER.getSchemaResourceName(schema);

            if (isNull(resourceName)) {
                throw new InvalidSchemaResourceNameException(schema);
            }

            if (!containers.includes(resourceName)) {
                await this._client.createContainer(resourceName);
            }
        }
    }

    public static FromConnectionString(connectionString: string): BlobStorage {
        return new BlobStorage(BlobServiceClient.fromConnectionString(connectionString));
    }
}
