import { ConsoleLogger, ILogger, LOGGER } from './debug';
import { FILE_SYSTEM } from './file-system';
import { Router } from './router';
import { ISchema } from './schema';
import { Server } from './server';

export async function init(port: number, dataPath: string, _schemas: Array<ISchema>, loggerClass: ILogger = new ConsoleLogger()): Promise<Server> {
    LOGGER.configure(loggerClass);
    await FILE_SYSTEM.configure(dataPath);
    const server: Server = new Server(port, new Router());

    LOGGER.debug(`Server started on port ${server.port}`);
    LOGGER.debug(`Loading data from  ${FILE_SYSTEM.path}`);

    return server;
}
