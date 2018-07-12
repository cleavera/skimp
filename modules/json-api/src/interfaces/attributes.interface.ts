import { IJsonValue, Maybe } from '../../../shared/src';

export interface IAttributes {
    [attribute: string]: Maybe<IJsonValue>;
}
