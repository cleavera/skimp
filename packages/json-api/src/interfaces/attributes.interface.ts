import { JsonPrimitive } from 'type-fest';

export interface IAttributes {
    [attribute: string]: JsonPrimitive | null;
}
