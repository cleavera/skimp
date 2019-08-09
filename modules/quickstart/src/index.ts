import { Maybe } from '@cleavera/utils';
import { API_REGISTER, DB_REGISTER } from '@skimp/core';
import { ConsoleLogger, ILogger, LOGGER } from '@skimp/debug';
import { FileSystem } from '@skimp/file-system';
import { HttpRouter, IAuthenticator } from '@skimp/http';
import { Api, Docs } from '@skimp/json-api';
import { ISchema } from '@skimp/schema';
import { Server } from '@skimp/server';

export async function init(port: number, dataPath: string, _schemas: Array<ISchema>, cors: boolean | string | Array<string> = false, version: string = 'UNVERSIONED', authenticator: Maybe<IAuthenticator> = null, loggerClass: ILogger = new ConsoleLogger(), fileSystem: FileSystem = FileSystem.create(dataPath)): Promise<Server> {
    LOGGER.setLogger(loggerClass);

    DB_REGISTER.configure(await fileSystem.createDb());
    API_REGISTER.configure(new Api(), '*/*');
    API_REGISTER.configure(new Api(), 'application/json');
    API_REGISTER.configure(new Docs(), 'documentation/json');
    const server: Server = new Server(port, new HttpRouter(version, authenticator, cors));

    LOGGER.debug(`Server started on port ${server.port}`);
    LOGGER.debug(`Loading data from  ${fileSystem.path}`);

    return server;
}
