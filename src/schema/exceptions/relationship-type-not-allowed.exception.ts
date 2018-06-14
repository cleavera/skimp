import { ValidationExceptionCode } from '../../router';

import { RelationshipPointer } from '../classes/relationship-pointer';
import { RelationshipValidationException } from './relationship-validation.exception';

export class RelationshipTypeNotAllowedException extends RelationshipValidationException {
    constructor(relationshipIndex: number) {
        super([new RelationshipPointer(relationshipIndex)], ValidationExceptionCode.RELATIONSHIP_TYPE_NOT_ALLOWED);
    }
}
