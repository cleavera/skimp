import { IJsonValue, Maybe } from '@skimp/shared';

export interface IValueSerialiser {
    (value: any): Maybe<IJsonValue>;
}
