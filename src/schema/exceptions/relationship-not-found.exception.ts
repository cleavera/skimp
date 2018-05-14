import { RelationshipPointer } from '..';
import { ValidationExceptionCode } from '../../router';
import { RelationshipValidationException } from './relationship-validation.exception';

export class RelationshipNotFoundException extends RelationshipValidationException {
    constructor(relationshipIndex: number) {
        super([new RelationshipPointer(relationshipIndex)], ValidationExceptionCode.RELATIONSHIP_NOT_FOUND);
    }
}
