import { $isNull, Maybe } from '@cleavera/utils';
import { API_REGISTER, ContentTypeNotSupportedException, IApi, IResponse, ResourceDoesNotExistException, ResourceLocation, ResponseCode } from '@skimp/core';
import { LOGGER } from '@skimp/debug';
import { ActionNotAllowedException, Router } from '@skimp/router';
import { ISchema, SCHEMA_REGISTER, ValidationException, ValidationExceptions } from '@skimp/schema';

import { MissingRequestBodyException } from '../exceptions/missing-request-body.exception';
import { NotAuthorisedException } from '../exceptions/not-authorised.exception';
import { IAuthenticator } from '../interfaces/authenticator.interface';
import { IHttpResponse } from '../interfaces/http-response.interface';
import { HttpRequest } from './http-request';

export class HttpRouter {
    public authenticator: Maybe<IAuthenticator>;
    private _coreRouter: Router;
    private readonly _cors: string | boolean | Array<string>;

    constructor(version: string, authenticator: Maybe<IAuthenticator> = null, cors: string | boolean | Array<string> = false) {
        this.authenticator = authenticator;
        this._coreRouter = new Router(version);
        this._cors = cors;
    }

    public async route(request: HttpRequest, response: IHttpResponse): Promise<void> {
        this._assignCors(request, response);

        if (!await this._authenticate(request)) {
            LOGGER.warn(new NotAuthorisedException());
            this._writeError(response, ResponseCode.NOT_AUTHORISED);

            return;
        }

        const api: Maybe<IApi> = this._getApi(request.type);

        if ($isNull(api)) {
            this._writeError(response, ResponseCode.NOT_ACCEPTABLE);

            return;
        }

        if ($isNull(request.location)) {
            await this._coreRouter.root(response, api);

            return;
        }

        if (request.isOptions) {
            this._options(request.location, response);

            return;
        }

        if (request.isGet) {
            await this._get(request.location, response, api);

            return;
        }

        if (request.isPost) {
            if ($isNull(request.content)) {
                this._missingBody(response);

                return;
            }

            try {
                await this._coreRouter.post(request.location, request.content, response, api);
            } catch (e) {
                this._handleError(e, response);
            }

            return;
        }

        if (request.isPut) {
            if ($isNull(request.content)) {
                this._missingBody(response);

                return;
            }

            try {
                await this._coreRouter.put(request.location, request.content, response, api);
            } catch (e) {
                this._handleError(e, response);
            }

            return;
        }

        if (request.isDelete) {
            await this._remove(request.location, response);

            return;
        }
    }

    private _options(location: ResourceLocation, response: IResponse): void {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            LOGGER.warn(new ResourceDoesNotExistException(location));
            this._writeError(response, ResponseCode.NOT_FOUND);

            return;
        }

        response.noContent();
    }

    private async _get(location: ResourceLocation, response: IResponse, api: IApi): Promise<void> {
        try {
            await this._coreRouter.get(location, response, api);
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                LOGGER.warn(e);
                this._writeError(response, ResponseCode.NOT_FOUND);
            } else {
                throw e;
            }
        }
    }

    private async _remove(location: ResourceLocation, response: IResponse): Promise<void> {
        try {
            await this._coreRouter.remove(location, response);
        } catch (e) {
            if (e instanceof ResourceDoesNotExistException) {
                LOGGER.warn(e);
                this._writeError(response, ResponseCode.NOT_FOUND);
            } else if (e instanceof ActionNotAllowedException) {
                LOGGER.warn(e);
                this._writeError(response, ResponseCode.METHOD_NOT_ALLOWED);
            } else {
                throw e;
            }
        }
    }

    private _getApi(type: Maybe<string>): Maybe<IApi> {
        try {
            return API_REGISTER.get(type);
        } catch (e) {
            if (e instanceof ContentTypeNotSupportedException) {
                LOGGER.warn(e);

                return null;
            }

            throw e;
        }
    }

    private _assignCors(request: HttpRequest, response: IHttpResponse): void {
        if (this._cors === false) {
            return;
        }

        if (this._cors === true) {
            response.corsHeader = request.origin || '*';
        } else {
            response.corsHeader = this._cors;
        }
    }

    private _authenticate(request: HttpRequest): Promise<boolean> {
        return $isNull(this.authenticator) || this.authenticator.authenticate(request);
    }

    private _missingBody(response: IResponse): void {
        const e: MissingRequestBodyException = new MissingRequestBodyException();

        LOGGER.warn(e);
        this._writeError(response, ResponseCode.BAD_REQUEST, [e]);
    }

    private _writeError(response: IResponse, code: number, e: Maybe<Array<Error>> = null): void {
        API_REGISTER.get().error(response, code, e);
    }

    private _handleError(e: Error, response: IResponse): void {
        if (e instanceof ResourceDoesNotExistException) {
            LOGGER.warn(e);
            this._writeError(response, ResponseCode.NOT_FOUND);
        } else if (e instanceof ActionNotAllowedException) {
            LOGGER.warn(e);
            this._writeError(response, ResponseCode.METHOD_NOT_ALLOWED);
            API_REGISTER.get().error(response, ResponseCode.METHOD_NOT_ALLOWED);
        } else if (e instanceof ValidationExceptions) {
            LOGGER.warn(...e);
            this._writeError(response, ResponseCode.BAD_REQUEST, e);
        } else if (e instanceof ValidationException) {
            LOGGER.warn(e);
            this._writeError(response, ResponseCode.BAD_REQUEST, [e]);
        } else if (e instanceof MissingRequestBodyException) {
            LOGGER.warn(e);
            this._writeError(response, ResponseCode.BAD_REQUEST, [e]);
        } else {
            throw e;
        }
    }
}
