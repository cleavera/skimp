import { mkdir } from 'fs';
import { join } from 'path';

import { Maybe } from '../../../core/src/index';
import { InvalidSchemaResourceNameException, SCHEMA_REGISTER } from '../../../schema/src/index';

import { FileSystemCannotBeReconfiguredException } from '../exceptions/file-system-cannot-be-reconfigured.exception';
import { FileSystemNotConfiguredException } from '../exceptions/file-system-not-configured.exception';
import ErrnoException = NodeJS.ErrnoException;

export class FileSystem {
    private _path: string;

    public get path(): string {
        if (!this._path) {
            throw new FileSystemNotConfiguredException();
        }

        return this._path;
    }

    public set path(path: string) {
        if (this._path) {
            throw new FileSystemCannotBeReconfiguredException();
        }

        this._path = path;
    }

    public async configure(path: string): Promise<void> {
        if (this._path) {
            throw new FileSystemCannotBeReconfiguredException();
        }

        this._path = path;

        for (const schema of SCHEMA_REGISTER.schemas) {
            const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);

            if (!resourceName) {
                throw new InvalidSchemaResourceNameException(schema);
            }

            const resourcePath: string = join(this.path, resourceName);

            await new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
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
        delete this._path;
    }
}
