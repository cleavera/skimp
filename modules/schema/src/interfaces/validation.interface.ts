import { Asyncable } from '@cleavera/utils';

export interface IValidation {
    (model: object): Asyncable<void>;
}
