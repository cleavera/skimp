import { IPromiseResolver } from '@cleavera/utils';
import { HttpRouter } from '@skimp/http';
import { createServer, IncomingMessage, Server as HttpServer, ServerResponse } from 'http';

import { Request } from './request';
import { Response } from './response';

export class Server {
    public port: number;

    private readonly _server: HttpServer;

    constructor(port: number, router: HttpRouter) {
        this.port = port;

        this._server = createServer(async(requestMessage: IncomingMessage, serverResponse: ServerResponse) => {
            const request: Request = await Request.fromIncomingMessage(requestMessage);
            const response: Response = new Response(serverResponse);

            try {
                await router.route(request, response);
            } catch (e) {
                response.error(e);
            }
        });

        this._server.listen(port);
    }

    public async close(): Promise<void> {
        await new Promise<void>((resolve: IPromiseResolver<void>): void => {
            this._server.close(() => {
                resolve();
            });
        });
    }
}
