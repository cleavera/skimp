import { Maybe } from '../../shared';
import { Url } from '../classes/url';
import { IContent } from './content.interface';

export interface IRequest {
    url: Url;
    content: Maybe<IContent>;
    method: string;
    readonly isGet: boolean;
    readonly isPut: boolean;
    readonly isPost: boolean;
    readonly isDelete: boolean;
    readonly isOptions: boolean;
    readonly accepts: Maybe<string>;
    readonly origin: Maybe<string | Array<string>>;
    readonly contentType: Maybe<string>;
}
