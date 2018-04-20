import { FileSystemCannotBeReconfiguredException } from '../exceptions/file-system-cannot-be-reconfigured.exception';
import { FileSystemNotConfiguredException } from '../exceptions/file-system-not-configured.exception';

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

    public reset(): void {
        delete this._path;
    }
}
