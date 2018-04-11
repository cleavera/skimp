import { Router } from './router/classes/router';
import { Server } from './server';

const server: Server = new Server(1337, new Router());

console.log(`Server started on port ${server.port}`);
