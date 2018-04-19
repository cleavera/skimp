import { ConsoleLogger, ILogger, logger } from './debug';
import { fileSystem } from './file-system';
import { Router } from './router';
import { Server } from './server';

export function init(port: number, dataPath: string, loggerClass: ILogger = new ConsoleLogger()): void {
    logger.configure(loggerClass);
    fileSystem.path = dataPath;
    const server: Server = new Server(port, new Router());

    logger.debug(`Server started on port ${server.port}`);
}
