import { createServer, IncomingMessage, ServerResponse } from 'http';

import { IRouter } from '../interfaces/router.interface';
import { Request } from './request';
import { Response } from './response';

export class Server {
    public port: number;

    constructor(port: number, router: IRouter) {
        this.port = port;

        createServer(async(requestMessage: IncomingMessage, serverResponse: ServerResponse) => {
            const request: Request = await Request.fromIncomingMessage(requestMessage);
            const response: Response = new Response(serverResponse);

            try {
                await router.route(request, response);
            } catch (e) {
                response.serverError(e);
            }
        }).listen(port);
    }
}
