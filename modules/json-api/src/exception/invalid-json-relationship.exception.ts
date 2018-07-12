import { RelationshipPointer, RelationshipValidationException, ValidationExceptionCode } from '../../../schema/src/index';

export class InvalidJSONRelationship extends RelationshipValidationException {
    constructor(relationship: number) {
        super([new RelationshipPointer(relationship)], ValidationExceptionCode.RELATIONSHIP_INVALID_JSON);
    }
}
