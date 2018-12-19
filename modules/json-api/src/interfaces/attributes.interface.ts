import { IJsonValue, Maybe } from '@cleavera/utils';

export interface IAttributes {
    [attribute: string]: Maybe<IJsonValue>;
}
