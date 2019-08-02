import { $isNull, Maybe } from '@cleavera/utils';
import { API_REGISTER, IResponse, IRouter, ResourceDoesNotExistException, ResourceLocation, ResponseCode } from '@skimp/core';
import { LOGGER } from '@skimp/debug';
import { IAuthenticator, Router } from '@skimp/router';
import { ISchema, SCHEMA_REGISTER } from '@skimp/schema';
import { IHttpRequest } from '../interfaces/http-request.interface';
import { IHttpResponse } from '../interfaces/http-response.interface';

export class HttpRouter implements IRouter {
    private _coreRouter: Router;
    private readonly _cors: string | boolean | Array<string>;

    constructor(version: string, authenticator: Maybe<IAuthenticator> = null, cors: string | boolean | Array<string>) {
        this._coreRouter = new Router(version, authenticator);
        this._cors = cors;
    }

    public async route(request: IHttpRequest, response: IHttpResponse): Promise<void> {
        this._assignCors(request, response);

        try {
            if (request.isOptions && request.location) {
                await this._options(request.location, response);

                return;
            }
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.NOT_FOUND);
            } else {
                throw e;
            }
        }

        await this._coreRouter.route(request, response);
    }

    private async _options(location: ResourceLocation, response: IResponse): Promise<void> {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        response.noContent();
    }

    private _assignCors(request: IHttpRequest, response: IHttpResponse): void {
        if (this._cors === false) {
            return;
        } else if (this._cors === true) {
            response.corsHeader = request.origin || '*';
        } else {
            response.corsHeader = this._cors;
        }
    }
}
