import { IResponse } from '@skimp/core';

export interface IHttpResponse extends IResponse {
    corsHeader: string | Array<string>;
}
