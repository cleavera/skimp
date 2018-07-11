export enum ValidationExceptionCode {
    REQUIRED = 'required',
    INVALID_STRING = 'invalidString',
    INVALID_NUMBER = 'invalidNumber',
    INVALID_INTEGER = 'invalidInteger',
    INVALID_DATE = 'invalidDate',
    INVALID_BOOLEAN = 'invalidBoolean',
    INVALID_JSON_DATA = 'invalidJsonData',
    INVALID_OPTION = 'invalidOption',
    RELATIONSHIP_NOT_FOUND = 'relationshipNotFound',
    RELATIONSHIP_INVALID_JSON = 'relationshipInvalidJSON',
    RELATIONSHIP_TYPE_NOT_ALLOWED = 'relationshipNotAllowed',
    RELATIONSHIP_LIMIT_REACHED = 'relationshipLimitReached'
}
