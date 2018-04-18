import { ConsoleLogger, logger } from './debug';
import { Router } from './router';
import { Server } from './server';

logger.configure(new ConsoleLogger());
const server: Server = new Server(1337, new Router());

console.log(`Server started on port ${server.port}`);
