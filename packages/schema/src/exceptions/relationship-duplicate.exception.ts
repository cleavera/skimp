import { RelationshipPointer } from '../classes/relationship-pointer';
import { ValidationExceptionCode } from '../constants/validation-exception-code.constant';
import { RelationshipValidationException } from './relationship-validation.exception';

export class RelationshipDuplicateException extends RelationshipValidationException {
    constructor(relationshipIndex: number) {
        super([new RelationshipPointer(relationshipIndex)], ValidationExceptionCode.RELATIONSHIP_DUPLICATE);
    }
}
