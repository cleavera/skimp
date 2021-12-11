import { JsonPrimitive } from 'type-fest';

export interface IValueDeserialiser {
    (value?: JsonPrimitive): any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
