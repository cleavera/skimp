import { InvalidSchemaResourceNameException, SCHEMA_REGISTER } from '@skimp/schema';
import { $isNull, IPromiseRejector, IPromiseResolver, Maybe } from '@skimp/shared';
import { mkdir } from 'fs';
import { join } from 'path';

import { FileSystemCannotBeReconfiguredException } from '../exceptions/file-system-cannot-be-reconfigured.exception';
import { FileSystemNotConfiguredException } from '../exceptions/file-system-not-configured.exception';
import ErrnoException = NodeJS.ErrnoException;

export class FileSystem {
    private _path: Maybe<string> = null;

    public get path(): string {
        if ($isNull(this._path)) {
            throw new FileSystemNotConfiguredException();
        }

        return this._path;
    }

    public set path(path: string) {
        if (!$isNull(this._path)) {
            throw new FileSystemCannotBeReconfiguredException();
        }

        this._path = path;
    }

    public async configure(path: string): Promise<void> {
        if (!$isNull(this._path)) {
            throw new FileSystemCannotBeReconfiguredException();
        }

        this._path = path;

        for (const schema of SCHEMA_REGISTER.schemas) {
            const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);

            if ($isNull(resourceName)) {
                throw new InvalidSchemaResourceNameException(schema);
            }

            const resourcePath: string = join(this.path, resourceName);

            await new Promise<void>((resolve: IPromiseResolver<void>, reject: IPromiseRejector<ErrnoException>): void => {
                mkdir(resourcePath, (err: ErrnoException) => {
                    if (err && err.code !== 'EEXIST') {
                        reject(err);

                        return;
                    }

                    resolve();
                });
            });
        }
    }

    public reset(): void {
        this._path = null;
    }
}
