import { ValidationExceptionCode } from '../../router';

import { RelationshipPointer } from '../classes/relationship-pointer';
import { ValidationException } from './validation.exception';

export class RelationshipValidationException extends ValidationException {
    public relationships: Array<RelationshipPointer>;
    public code: ValidationExceptionCode;

    constructor(relationships: Array<RelationshipPointer>, code: ValidationExceptionCode) {
        super(code, `Validation issue "${code}" occurred on "${relationships.join(',')}"`);
        this.relationships = relationships;
    }
}
