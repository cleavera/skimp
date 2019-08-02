import { IJsonValue, Maybe } from '@cleavera/utils';

export interface IValueSerialiser {
    (value: unknown): Maybe<IJsonValue>;
}
