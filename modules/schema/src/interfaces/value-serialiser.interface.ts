import { IJsonValue, Maybe } from '@cleavera/utils';

export interface IValueSerialiser {
    (value: any): Maybe<IJsonValue>;
}
