import { Maybe } from '@cleavera/utils';
import { ConsoleLogger, ILogger } from '@skimp/debug';
import { FileSystem } from '@skimp/file-system';
import { IAuthenticator } from '@skimp/http';
import { init } from '@skimp/quickstart';
import { ISchema } from '@skimp/schema';
import { Server } from '@skimp/server';

export class TestServer {
    private readonly _server: Server;
    private readonly _fileSystem: FileSystem;

    constructor(server: Server, fileSystem: FileSystem) {
        this._server = server;
        this._fileSystem = fileSystem;
    }

    public async clearData(): Promise<void> {
        await this._fileSystem.wipeData();
    }

    public async close(): Promise<void> {
        await this._server.close();
        await this.clearData();
    }

    public static async create(port: number, dataPath: string, _schemas: Array<ISchema>, cors: boolean | string | Array<string> = false, version: string = 'UNVERSIONED', authenticator: Maybe<IAuthenticator> = null, loggerClass: ILogger = new ConsoleLogger()): Promise<TestServer> {
        const fileSystem: FileSystem = FileSystem.create(dataPath);
        const server: Server = await init(port, fileSystem.path, _schemas, cors, version, authenticator, loggerClass, fileSystem) as any; // eslint-disable-line

        return new TestServer(server, fileSystem);
    }
}
