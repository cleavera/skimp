import { RelationshipPointer, RelationshipValidationException } from '../../schema';
import { ValidationExceptionCode } from '../../validation';

export class InvalidJSONRelationship extends RelationshipValidationException {
    constructor(relationship: number) {
        super([new RelationshipPointer(relationship)], ValidationExceptionCode.RELATIONSHIP_INVALID_JSON);
    }
}
