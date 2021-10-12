import { JsonPrimitive } from 'type-fest';

export interface IOptions<T extends JsonPrimitive = JsonPrimitive> extends Array<T> { } // eslint-disable-line @typescript-eslint/no-empty-interface
