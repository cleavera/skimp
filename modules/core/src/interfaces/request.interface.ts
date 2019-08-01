import { Maybe } from '@cleavera/utils';
import { ResourceLocation } from '../classes/resource-location';
import { IContent } from './content.interface';

export interface IRequest {
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
