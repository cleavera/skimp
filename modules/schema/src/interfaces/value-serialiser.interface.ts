import { JsonPrimitive } from 'type-fest';

export interface IValueSerialiser<T = unknown> {
    (value: T): JsonPrimitive;
}
