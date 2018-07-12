import { IJsonValue, Maybe } from '@skimp/shared';

export interface IAttributes {
    [attribute: string]: Maybe<IJsonValue>;
}
