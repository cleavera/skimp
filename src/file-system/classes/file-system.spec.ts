import { Expect, Setup, Test, TestFixture } from 'alsatian';
import { FileSystemCannotBeReconfiguredException } from '../exceptions/file-system-cannot-be-reconfigured.exception';
import { FileSystemNotConfiguredException } from '../exceptions/file-system-not-configured.exception';
import { FileSystem } from './file-system';

@TestFixture('FileSystem.Path')
export class FileSystemPathSpec {
    public fileSystem: FileSystem;

    public noop(..._values: Array<any>): void {} // tslint:disable-line no-any no-empty

    @Setup
    public setup(): void {
        this.fileSystem = new FileSystem();
    }

    @Test('when getting the path when no path is configured it should throw a FileSystemNotConfiguredException')
    public getNoPathConfigured(): void {
        Expect(() => {
            this.noop(this.fileSystem.path);
        }).toThrowError(FileSystemNotConfiguredException, 'The data path has not been configured');
    }

    @Test('when setting the path when the path has already been set it should throw a FileSystemCannotBeReconfiguredException')
    public setPathAlreadyConfigured(): void {
        this.fileSystem.path = 'good';

        Expect(() => {
            this.fileSystem.path = 'oops';
        }).toThrowError(FileSystemCannotBeReconfiguredException, 'The data path cannot be changed while the server is running');
    }

    @Test('when setting the path it should return the path')
    public setPath(): void {
        this.fileSystem.path = 'good';

        Expect(this.fileSystem.path).toBe('good');
    }
}
