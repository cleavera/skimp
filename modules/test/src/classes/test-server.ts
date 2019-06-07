import { Maybe } from '@cleavera/utils';
import { API_REGISTER, DB_REGISTER } from '@skimp/core';
import { ConsoleLogger, ILogger, LOGGER } from '@skimp/debug';
import { FileSystem } from '@skimp/file-system';
import { Api, Docs } from '@skimp/json-api';
import { IAuthenticator, Router } from '@skimp/router';
import { ISchema } from '@skimp/schema';
import { Server } from '@skimp/server';

export class TestServer {
    private _server: Server;
    private _fileSystem: FileSystem;

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
    LOGGER.setLogger(loggerClass);

    const fileSystem: FileSystem = FileSystem.create(dataPath);

    DB_REGISTER.configure(await fileSystem.createDb());
    API_REGISTER.configure(new Api(), '*/*');
    API_REGISTER.configure(new Api(), 'application/json');
    API_REGISTER.configure(new Docs(), 'documentation/json');
    const server: Server = new Server(port, new Router(version, cors, authenticator));

    LOGGER.debug(`Server started on port ${server.port}`);
    LOGGER.debug(`Loading data from  ${fileSystem.path}`);

    return new TestServer(server, fileSystem);
}

}
