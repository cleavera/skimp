import { IJsonValue, Maybe } from '../../shared';

export interface IAttributes {
    [attribute: string]: Maybe<IJsonValue>;
}
