import { IPromiseResolver } from '@cleavera/utils';
import { IRouter } from '@skimp/core';
import { createServer, IncomingMessage, Server as HttpServer, ServerResponse } from 'http';

import { Request } from './request';
import { Response } from './response';

export class Server {
    public port: number;

    private readonly _cors: string | boolean | Array<string>;
    private readonly _server: HttpServer;

    constructor(port: number, router: IRouter, cors: string | boolean | Array<string>) {
        this.port = port;
        this._cors = cors;

        this._server = createServer(async(requestMessage: IncomingMessage, serverResponse: ServerResponse) => {
            const request: Request = await Request.fromIncomingMessage(requestMessage);
            const response: Response = new Response(serverResponse);

            this._assignCors(request, response);

            try {
                await router.route(request, response);
            } catch (e) {
                response.serverError(e);
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

    private _assignCors(request: Request, response: Response): void {
        if (this._cors === false) {
            return;
        } else if (this._cors === true) {
            response.corsHeader = request.origin || '*';
        } else {
            response.corsHeader = this._cors;
        }
    }
}
