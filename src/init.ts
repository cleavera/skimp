import { ConsoleLogger, ILogger, LOGGER } from './debug';
import { FILE_SYSTEM } from './file-system';
import { Api } from './json-api';
import { Db } from './json-file';
import { API_REGISTER, DB_REGISTER, Router } from './router';
import { ISchema } from './schema';
import { Server } from './server';

export async function init(port: number, dataPath: string, _schemas: Array<ISchema>, cors: boolean | string | Array<string> = false, version: string = 'UNVERSIONED', loggerClass: ILogger = new ConsoleLogger()): Promise<Server> {
    LOGGER.setLogger(loggerClass);
    await FILE_SYSTEM.configure(dataPath);
    DB_REGISTER.configure(new Db());
    API_REGISTER.configure(new Api(), 'application/json');
    const server: Server = new Server(port, new Router(version, cors));

    LOGGER.debug(`Server started on port ${server.port}`);
    LOGGER.debug(`Loading data from  ${FILE_SYSTEM.path}`);

    return server;
}
