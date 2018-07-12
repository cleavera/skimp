import { RelationshipPointer, RelationshipValidationException, ValidationExceptionCode } from '@skimp/schema';

export class InvalidJSONRelationship extends RelationshipValidationException {
    constructor(relationship: number) {
        super([new RelationshipPointer(relationship)], ValidationExceptionCode.RELATIONSHIP_INVALID_JSON);
    }
}
