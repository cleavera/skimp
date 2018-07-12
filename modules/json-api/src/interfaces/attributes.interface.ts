import { IJsonValue, Maybe } from '../../../core/src/index';

export interface IAttributes {
    [attribute: string]: Maybe<IJsonValue>;
}
