import { $isNull, IPromiseRejector, IPromiseResolver, Maybe } from '@cleavera/utils';
import { Db } from '@skimp/json-file';
import { InvalidSchemaResourceNameException, SCHEMA_REGISTER } from '@skimp/schema';
import { mkdir } from 'fs';
import { join } from 'path';
import { EntityFactory } from './entity-factory';
import ErrnoException = NodeJS.ErrnoException;

export class FileSystem {
    public readonly path: string;
    private readonly _entityFactory: EntityFactory;

    constructor(basePath: string) {
        this.path = basePath;
        this._entityFactory = new EntityFactory(basePath);
    }

    public async wipeData(): Promise<void> {
        let files: Array<string> = [];

        for (const schema of SCHEMA_REGISTER.schemas) {
            files = files.concat(await (await this._entityFactory.fromPath(`/${SCHEMA_REGISTER.getSchemaResourceName(schema)}`)).listChildren());
        }

        await Promise.all(files.map(async(file: string) => {
            await (await this._entityFactory.fromPath(file)).delete();
        }));
    }

    public async createDb(): Promise<Db> {
        await this._initialise();

        return Db.create(this._entityFactory);
    }

    public async _initialise(): Promise<void> {
        for (const schema of SCHEMA_REGISTER.schemas) {
            const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);

            if ($isNull(resourceName)) {
                throw new InvalidSchemaResourceNameException(schema);
            }

            const resourcePath: string = join(this.path, resourceName);

            await new Promise<void>((resolve: IPromiseResolver<void>, reject: IPromiseRejector<ErrnoException>): void => {
                mkdir(resourcePath, { recursive: true }, (err: ErrnoException) => {
                    if (err && err.code !== 'EEXIST') {
                        reject(err);

                        return;
                    }

                    resolve();
                });
            });
        }
    }

    public static create(basePath: string): FileSystem {
        return new FileSystem(basePath);
    }
}
