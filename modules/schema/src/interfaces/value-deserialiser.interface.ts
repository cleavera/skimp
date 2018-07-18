import { IJsonValue, Maybe } from '@skimp/shared';

export interface IValueDeserialiser {
    (value?: Maybe<IJsonValue>): any;
}
