import { createServer, IncomingMessage, ServerResponse } from 'http';

import { IRouter } from '../interfaces/router.interface';
import { Request } from './request';
import { Response } from './response';

export class Server {
    public port: number;

    constructor(port: number, router: IRouter) {
        this.port = port;

        createServer(async(requestMessage: IncomingMessage, response: ServerResponse) => {
            const request: Request = await Request.fromIncomingMessage(requestMessage);

            router.route(request, new Response(response)).then(() => void 0, () => void 0);
        }).listen(port);
    }
}
