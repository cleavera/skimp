import { createServer, IncomingMessage, Server as HttpServer, ServerResponse } from 'http';

import { FILE_SYSTEM } from '../../file-system';

import { IRouter } from '../interfaces/router.interface';
import { Request } from './request';
import { Response } from './response';

export class Server {
    public port: number;

    private _server: HttpServer;

    constructor(port: number, router: IRouter) {
        this.port = port;

        this._server = createServer(async(requestMessage: IncomingMessage, serverResponse: ServerResponse) => {
            const request: Request = await Request.fromIncomingMessage(requestMessage);
            const response: Response = new Response(serverResponse);

            try {
                await router.route(request, response);
            } catch (e) {
                response.serverError(e);
            }
        });

        this._server.listen(port);
    }

    public async close(): Promise<void> {
        await new Promise<void>((resolve: () => void): void => {
            this._server.close(() => {
                FILE_SYSTEM.reset();
                resolve();
            });
        });
    }
}
