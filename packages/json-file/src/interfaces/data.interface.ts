import { JsonPrimitive } from 'type-fest';

export interface IData {
    [attribute: string]: JsonPrimitive;
}
