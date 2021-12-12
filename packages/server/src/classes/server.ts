import { HttpRequest, HttpRouter } from '@skimp/http';
import { createServer, IncomingMessage, Server as HttpServer, ServerResponse } from 'http';

import { RequestFactory } from './request.factory';
import { Response } from './response';

export class Server {
    public port: number;

    private readonly _server: HttpServer;

    constructor(port: number, router: HttpRouter) {
        this.port = port;

        this._server = createServer(async(requestMessage: IncomingMessage, serverResponse: ServerResponse) => {
            const request: HttpRequest = await RequestFactory.FromIncomingMessage(requestMessage);
            const response: Response = new Response(serverResponse);

            try {
                await router.route(request, response);
            } catch (e) {
                response.error(e as Error);
            }
        });

        this._server.listen(port);
    }

    public async close(): Promise<void> {
        await new Promise<void>((resolve: () => void): void => {
            this._server.close(() => {
                resolve();
            });
        });
    }
}
