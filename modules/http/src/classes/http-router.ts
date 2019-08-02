import { $isNull, Maybe } from '@cleavera/utils';
import { API_REGISTER, ContentTypeNotSupportedException, IApi, IResponse, ResourceDoesNotExistException, ResourceLocation, ResponseCode } from '@skimp/core';
import { LOGGER } from '@skimp/debug';
import { ActionNotAllowedException, Router } from '@skimp/router';
import { ISchema, SCHEMA_REGISTER, ValidationException, ValidationExceptions } from '@skimp/schema';

import { MissingRequestBodyException } from '../exceptions/missing-request-body.exception';
import { NotAuthorisedException } from '../exceptions/not-authorised.exception';
import { IAuthenticator } from '../interfaces/authenticator.interface';
import { IHttpRequest } from '../interfaces/http-request.interface';
import { IHttpResponse } from '../interfaces/http-response.interface';

export class HttpRouter {
    public authenticator: Maybe<IAuthenticator>;
    private _coreRouter: Router;
    private readonly _cors: string | boolean | Array<string>;

    constructor(version: string, authenticator: Maybe<IAuthenticator> = null, cors: string | boolean | Array<string>) {
        this.authenticator = authenticator;
        this._coreRouter = new Router(version);
        this._cors = cors;
    }

    public async route(request: IHttpRequest, response: IHttpResponse): Promise<void> {
        this._assignCors(request, response);

        try {
            await this._authenticate(request);
        } catch (e) {
            if (e instanceof NotAuthorisedException) {
                LOGGER.warn(e);
                API_REGISTER.get().error(response, ResponseCode.NOT_AUTHORISED);
            }
        }

        const api: IApi = API_REGISTER.get(request.type);

        if ($isNull(request.location)) {
            await this._coreRouter.root(response, api);

            return;
        }

        if (request.isOptions) {
            try {
                await this._options(request.location, response);
            } catch (e) {
                if (e instanceof ResourceDoesNotExistException) {
                    LOGGER.warn(e);
                    API_REGISTER.get().error(response, ResponseCode.NOT_FOUND);
                } else {
                    throw e;
                }
            }

            return;
        }

        if (request.isGet) {
            try {
                await this._coreRouter.get(request.location, response, api);
            } catch (e) {
                if (e instanceof ResourceDoesNotExistException) {
                    LOGGER.warn(e);
                    API_REGISTER.get().error(response, ResponseCode.NOT_FOUND);
                } else {
                    throw e;
                }
            }

            return;
        }

        if (request.isPost) {
            try {
                if ($isNull(request.content)) {
                    throw new MissingRequestBodyException();
                }

                await this._coreRouter.post(request.location, request.content, response, api);
            } catch (e) {
                this._handleError(e, response);
            }

            return;
        }

        if (request.isPut) {
            try {
                if ($isNull(request.content)) {
                    throw new MissingRequestBodyException();
                }

                await this._coreRouter.put(request.location, request.content, response, api);
            } catch (e) {
                this._handleError(e, response);
            }

            return;
        }

        if (request.isDelete) {
            try {
                await this._coreRouter.remove(request.location, response);
            } catch (e) {
                if (e instanceof ResourceDoesNotExistException) {
                    LOGGER.warn(e);
                    API_REGISTER.get().error(response, ResponseCode.NOT_FOUND);
                } else if (e instanceof ActionNotAllowedException) {
                    LOGGER.warn(e);
                    API_REGISTER.get().error(response, ResponseCode.METHOD_NOT_ALLOWED);
                } else {
                    throw e;
                }
            }

            return;
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

    private async _authenticate(request: IHttpRequest): Promise<void> {
        if (!$isNull(this.authenticator)) {
            try {
                await this.authenticator.authenticate(request);
            } catch (e) {
                throw new NotAuthorisedException();
            }
        }
    }

    private _handleError(e: Error, response: IResponse): void {
        if (e instanceof ResourceDoesNotExistException) {
            LOGGER.warn(e);
            API_REGISTER.get().error(response, ResponseCode.NOT_FOUND);
        } else if (e instanceof ActionNotAllowedException) {
            LOGGER.warn(e);
            API_REGISTER.get().error(response, ResponseCode.METHOD_NOT_ALLOWED);
        } else if (e instanceof ValidationExceptions) {
            LOGGER.warn(...e);
            API_REGISTER.get().error(response, ResponseCode.BAD_REQUEST, e);
        } else if (e instanceof ValidationException) {
            LOGGER.warn(e);
            API_REGISTER.get().error(response, ResponseCode.BAD_REQUEST, [e]);
        } else if (e instanceof ContentTypeNotSupportedException) {
            LOGGER.warn(e);
            API_REGISTER.get().error(response, ResponseCode.NOT_ACCEPTABLE);
        } else if (e instanceof ContentTypeNotSupportedException) {
            LOGGER.warn(e);
            API_REGISTER.get().error(response, ResponseCode.BAD_REQUEST, [e]);
        } else if (e instanceof MissingRequestBodyException) {
            LOGGER.warn(e);
            API_REGISTER.get().error(response, ResponseCode.BAD_REQUEST, [e]);
        } else {
            throw e;
        }
    }
}
