import { Nullable } from '../../shared';
import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { InvalidPointerException } from '../exceptions/invalid-pointer.exception';

export class ModelPointer {
    public readonly property: string;
    public readonly field: string;

    constructor(model: any, property: string) {
        const field: Nullable<string> = SCHEMA_REGISTER.mapToField(model.constructor, property);

        if ((!(property in model)) || !field) {
            throw new InvalidPointerException(model, property);
        }

        this.property = property;
        this.field = field;
    }

    public toString(): string {
        return this.field;
    }
}