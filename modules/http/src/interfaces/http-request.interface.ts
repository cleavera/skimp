import { Maybe } from '@cleavera/utils';
import { IContent, ResourceLocation } from '@skimp/core';

export interface IHttpRequest {
    origin: Maybe<string | Array<string>>;
    location: Maybe<ResourceLocation>;
    content: Maybe<IContent>;
    method: string;
    readonly isGet: boolean;
    readonly isPut: boolean;
    readonly isPost: boolean;
    readonly isDelete: boolean;
    readonly isOptions: boolean;
    readonly type: Maybe<string>;
}
