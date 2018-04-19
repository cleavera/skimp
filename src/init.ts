import { ConsoleLogger, ILogger, logger } from './debug';
import { Router } from './router';
import { Server } from './server';

export function init(port: number, loggerClass: ILogger = new ConsoleLogger()): void {
    logger.configure(loggerClass);
    const server: Server = new Server(port, new Router());

    logger.debug(`Server started on port ${server.port}`);
}
