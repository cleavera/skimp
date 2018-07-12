import { IJsonValue, Maybe } from '../../core';

export interface IAttributes {
    [attribute: string]: Maybe<IJsonValue>;
}
