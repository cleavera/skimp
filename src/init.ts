import { ConsoleLogger, ILogger, LOGGER } from './debug';
import { FILE_SYSTEM } from './file-system';
import { Router } from './router';
import { Server } from './server';

export function init(port: number, dataPath: string, loggerClass: ILogger = new ConsoleLogger()): void {
    LOGGER.configure(loggerClass);
    FILE_SYSTEM.path = dataPath;
    const server: Server = new Server(port, new Router());

    LOGGER.debug(`Server started on port ${server.port}`);
}
