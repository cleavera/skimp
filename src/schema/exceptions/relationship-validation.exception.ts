import { ValidationExceptionCode } from '../../router';
import { ValidationException } from '../../validators';
import { RelationshipPointer } from '../classes/relationship-pointer';

export class RelationshipValidationException extends ValidationException {
    public relationships: Array<RelationshipPointer>;
    public code: ValidationExceptionCode;

    constructor(relationships: Array<RelationshipPointer>, code: ValidationExceptionCode) {
        super(code, `Validation issue "${code}" occurred on "${relationships.join(',')}"`);
        this.relationships = relationships;
    }
}
