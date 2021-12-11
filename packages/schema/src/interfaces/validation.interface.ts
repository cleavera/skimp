import { Promisable } from 'type-fest';

export interface IValidation {
    (model: object): Promisable<void>;
}
