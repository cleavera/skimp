import { $isNull, Maybe } from '@cleavera/utils';

import { HttpStatusCode } from '../constants/http-status.constant';
import { HttpRequestMethod } from '../constants/request-method.constant';
import { HttpError } from '../errors/http.error';
import { Request404Error } from '../errors/request-404.error';

export class HttpRequest {
    public static async get<T>(url: string): Promise<T> {
        const response: Response = await fetch(url, this._getConfig(HttpRequestMethod.GET));

        if (!response.ok) {
            this._handleError(response);
        }

        return response.json();
    }

    public static async delete(url: string): Promise<void> {
        const response: Response = await fetch(url, this._getConfig(HttpRequestMethod.DELETE));

        if (!response.ok) {
            this._handleError(response);
        }
    }

    public static async put<T>(url: string, body: T): Promise<T> {
        const response: Response = await fetch(url, this._getConfig(HttpRequestMethod.PUT, body));

        if (!response.ok) {
            this._handleError(response);
        }

        return response.json();
    }

    public static async post<T>(url: string, body: T): Promise<T> {
        const response: Response = await fetch(url, this._getConfig(HttpRequestMethod.POST, body));

        if (!response.ok) {
            this._handleError(response);
        }

        return response.json();
    }

    private static _handleError(response: Response): void {
        if (response.status === HttpStatusCode.NOT_FOUND) {
            throw new Request404Error(response.url);
        } else {
            throw new HttpError(response.status, response.url);
        }
    }

    private static _getConfig(method: HttpRequestMethod, body: Maybe<unknown> = null): RequestInit {
        const config: RequestInit = {
            method,
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (!$isNull(body)) {
            config.body = JSON.stringify(body);
        }

        return config;
    }
}
