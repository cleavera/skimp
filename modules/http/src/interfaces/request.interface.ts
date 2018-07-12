import { Maybe } from '../../../core/src/index';
import { Uri } from '../classes/uri';
import { IContent } from './content.interface';

export interface IRequest {
    url: Uri;
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
