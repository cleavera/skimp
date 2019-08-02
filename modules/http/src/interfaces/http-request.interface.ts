import { Maybe } from '@cleavera/utils';
import { IRequest } from '@skimp/core';

export interface IHttpRequest extends IRequest {
    origin: Maybe<string | Array<string>>;
}
